# Sistema de Gestión de Inventario para Tienda

**Estado**: ✅ **COMPLETAMENTE FUNCIONAL**

---

## 🚀 Inicio Rápido

### 1. Inicia el servidor
```bash
npm start
```

### 2. En otra terminal, prueba todo
```bash
# Opción A: Diagnóstico completo (recomendado)
node diagnostico.js

# O prueba individual:
node test-db.js      # Valida MySQL
node test-login.js   # Prueba login
```

### 3. Accede a la aplicación
- **URL**: http://localhost:3000/login
- **Admin 1**: admin@tienda.com / admin123
- **Admin 2**: vania@gmail.com / 1234

---

## 📊 Cambios Implementados

| Tarea | Descripción | Archivo |
|-------|-------------|---------|
| ✅ Segundo Admin | Usuario vania@gmail.com creado automáticamente | `src/config/adminUsers.js` |
| ✅ Test MySQL | Valida conexión, BD, tablas, usuarios | `test-db.js` |
| ✅ Endpoint /api/test | GET para diagnosticar sistema | `src/routes/testRoutes.js` |
| ✅ Test Login | Prueba automática de ambos admin | `test-login.js` |
| ✅ Validación Flujo | Login → Dashboard completamente funcional | ✓ Verificado |
| ✅ Diagnóstico | Script que verifica TODO | `diagnostico.js` |

---

## 👥 Usuarios Administrativos

```
Admin 1:
  Email:    admin@tienda.com
  Password: admin123

Admin 2:
  Email:    vania@gmail.com
  Password: 1234
```

> Los usuarios se crean automáticamente si no existen.

---

## 🧪 Scripts de Prueba

```bash
# Prueba conectividad MySQL
node test-db.js

# Prueba login automático
node test-login.js

# Diagnóstico COMPLETO del sistema
node diagnostico.js
```

---

## 📁 Nuevos Archivos

**Backend:**
- `src/config/adminUsers.js` - Verificación de usuarios
- `src/routes/testRoutes.js` - Endpoint /api/test
- `database/02_insert_admins.sql` - SQL de usuarios

**Scripts:**
- `test-db.js` - Validación MySQL
- `test-login.js` - Prueba de login
- `diagnostico.js` - Diagnóstico completo
- `generate-hashes.js` - Generador de hashes (temporal)

**Documentación:**
- `GUIA_COMPLETA.md` - Documentación completa
- `VALIDACION_MYSQL.md` - Guía MySQL
- `README.md` - Este archivo

---

## 🔍 Características

✅ **Dos administradores** - Ambos funcionando  
✅ **Login seguro** - Bcrypt + JWT  
✅ **Base de datos** - MySQL conectada y verificada  
✅ **API REST** - Todas las rutas funcionales  
✅ **Dashboard** - Carga correctamente  
✅ **Diagnóstico** - Script de verificación completo  
✅ **Sin cambios** - Frontend intacto, solo agregar funcionalidad

---

## ⚡ Comando Todo en Uno

```bash
npm start &  # Inicia servidor en background
sleep 2      # Espera a que inicie
node diagnostico.js  # Ejecuta diagnóstico completo
```

---

## 📝 Flujo Completo

```
npm start → Carga .env → Conecta MySQL → Crea usuarios → ✅ Listo
    ↓
http://localhost:3000/login
    ↓
Ingresa: admin@tienda.com / admin123
    ↓
POST /api/auth/login → Valida bcrypt → Genera JWT
    ↓
Guarda token en localStorage
    ↓
Redirige a index.html
    ↓
checkLogin() verifica token
    ↓
Carga dashboard ✅
```

---

## 🎯 Verificación

Ejecuta esto para verificar que TODO funciona:

```bash
node diagnostico.js
```

**Deberías ver al final:**
```
🎉 ¡SISTEMA LISTO PARA PRODUCCIÓN!

✅ TODOS LOS COMPONENTES FUNCIONAN CORRECTAMENTE
```

---

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| "mysql not found" | `npm install mysql2` |
| "bcrypt not found" | `npm install bcrypt` |
| "Server not running" | Ejecuta `npm start` en otra terminal |
| "Access denied MySQL" | Verifica credenciales en .env |
| "Port 3000 in use" | Cambia PORT en .env o mata proceso en :3000 |

---

## 📚 Documentación Completa

- **GUIA_COMPLETA.md** - Guía detallada (70 secciones)
- **VALIDACION_MYSQL.md** - Pasos MySQL
- **database/02_insert_admins.sql** - SQL de usuarios
- **database/test-connection.sql** - SQL de diagnóstico

---

## ✨ Próximos Pasos

1. ✅ Verifica que npm start funciona
2. ✅ Ejecuta `node diagnostico.js`
3. ✅ Abre http://localhost:3000/login
4. ✅ Prueba con admin@tienda.com / admin123
5. ✅ Accede al dashboard

---

**¡Sistema completamente funcional y listo para usar!** 🎉

Cualquier pregunta, revisa GUIA_COMPLETA.md
