# 🔧 GUÍA DE VALIDACIÓN DE CONEXIÓN MySQL

## El Error

```
Access denied for user 'root'@'localhost' (using password: YES)
```

Significa que MySQL rechazó las credenciales. Aquí cómo validar y resolver.

---

## PASO 1: Verifica que MySQL está ejecutándose

### Windows
```powershell
# Opción 1: Por línea de comandos
mysql -u root

# Si funciona, MySQL está corriendo
# Si no funciona, inicia el servicio
net start MySQL80

# O si tienes MySQL 5.7:
net start MySQL57
```

### Mac / Linux
```bash
# Verificar estado
brew services list | grep mysql
sudo systemctl status mysql

# Iniciar si no está corriendo
brew services start mysql
sudo systemctl start mysql
```

---

## PASO 2: Verifica .env (muy importante)

Abre `.env` y asegúrate de que tiene exactamente:

```env
PORT=3000
DB_HOST=acela.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=sTJipQKINLyztzSAgWgkScBPBlOmidoR
DB_NAME=mysql_railway
DB_PORT=32431
```

⚠️ **VALIDACIÓN:**
- ✅ No hay espacios alrededor del `=`
- ✅ `DB_PASSWORD` no tiene comillas
- ✅ No hay caracteres especiales no escapados

---

## PASO 3: Prueba la conexión directamente

Desde terminal, en la carpeta del proyecto:

```bash
node test-db.js
```

### Resultados esperados:

**✅ Si funciona:**
```
🧪 PRUEBA DE CONEXIÓN MYSQL
========================================================

📋 CONFIGURACIÓN DESDE .env:

Host:     localhost
Port:     3306
User:     root
Password: ✓ Definida
Database: gestion_tienda

📡 Paso 1: Conectando a MySQL sin seleccionar base de datos...
✅ Conexión exitosa al servidor MySQL

📡 Paso 2: Conectando a base de datos específica...
✅ Conexión exitosa a base de datos 'gestion_tienda'

📡 Paso 3: Verificando ping...
✅ Ping exitoso

✅ TODOS LOS TESTS PASARON
```

**❌ Si falla con "Access denied":**
- La contraseña es incorrecta
- El usuario `root` no tiene esa contraseña
- Ve a PASO 4

---

## PASO 4: Si la contraseña es incorrecta

### Opción A: Usa la contraseña que MySQL tiene

1. Desde MySQL Workbench o línea de comandos, intenta conectar:
```bash
mysql -u root -p
# Ingresa la contraseña que conoces
```

2. Una vez dentro, cambia .env a la contraseña correcta:
```env
DB_PASSWORD=Pablo.141
```

3. Vuelve a ejecutar:
```bash
node test-db.js
```

### Opción B: Reinicia la contraseña de root

⚠️ **Solo si conoces la contraseña de administrador del sistema**

#### En Windows:
```bash
# 1. Detén MySQL
net stop MySQL80

# 2. Inicia sin verificar contraseña
mysqld --skip-grant-tables

# 3. En otra terminal, conéctate sin contraseña
mysql -u root

# 4. Dentro de MySQL, ejecuta:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Pablo.141';
FLUSH PRIVILEGES;
EXIT;

# 5. Mata mysqld (Ctrl+C en la terminal donde está corriendo)
# 6. Reinicia MySQL normalmente
net start MySQL80
```

#### En Mac/Linux:
```bash
# Similar, pero usa:
sudo /usr/local/mysql/support-files/mysql.server stop
sudo mysqld --skip-grant-tables &
mysql -u root
# ... luego los mismos comandos SQL
```

---

## PASO 5: Verifica que la base de datos existe

Ejecuta:
```bash
mysql -u root -pPablo.141 -e "SHOW DATABASES LIKE 'gestion_tienda';"
```

### Si NO aparece `gestion_tienda`:

Crea e importa el SQL:
```bash
# 1. Crear la base de datos
mysql -u root -pPablo.141 -e "CREATE DATABASE gestion_tienda;"

# 2. Importar la estructura
mysql -u root -pPablo.141 gestion_tienda < database/gestion_tienda.sql
```

---

## PASO 6: Inicia el servidor

Una vez que `node test-db.js` funciona sin errores:

```bash
npm start
```

### Deberías ver:
```
📊 CREDENCIALES DE CONEXIÓN:
  Host: localhost
  Port: 3306
  User: root
  Database: gestion_tienda
  Password: ✓ Definida

🔍 Intentando conexión a MySQL...
✅ MySQL conectado correctamente

🚀 Servidor ejecutándose en http://localhost:3000
✅ Base de datos lista para usar
```

---

## 🆘 Si aún falla

Ejecuta este SQL en MySQL para diagnosticar:

```sql
-- Ver el usuario actual
SELECT USER() as 'Usuario Actual';

-- Listar usuarios
SELECT user, host FROM mysql.user;

-- Ver grants del usuario root
SHOW GRANTS FOR 'root'@'localhost';

-- Ver bases de datos
SHOW DATABASES;
```

Copiaré estos comandos a `database/test-connection.sql`.

---

## ⚡ Resumen del flujo corregido

**Antes (❌ Fallaba):**
1. `server.js` → `app.js` → controladores requieren `db.js`
2. `db.js` llamaba `verifyConnection()` sin esperar
3. El pool se devolvía antes de verificarse
4. Cuando se usaba, si fallaba, el servidor ya estaba escuchando
5. Error: "Access denied" pero el servidor seguía corriendo

**Después (✅ Funciona):**
1. `server.js` carga `.env` primero
2. `server.js` llama a `pool.verifyConnection()` con `await`
3. Si falla, muestra el error y no inicia Express
4. Solo si la conexión funciona, Express empieza a escuchar
5. Los controladores reciben un pool que YA fue validado
