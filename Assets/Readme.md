
# 📚 Estructura del Proyecto Web con Firestore

## 🎯 Objetivo del sistema

Sistema web universitario construido con HTML, CSS y JS (sin frameworks), que utiliza Firebase Authentication y Cloud Firestore mediante CDN. Permite a los maestros registrar y consultar equipos participantes en eventos institucionales, organizados por año, tipo de evento y modalidad.

---

## 🔐 Autenticación

- Se utiliza **Firebase Authentication** con correo y contraseña.
- Información adicional del usuario (nombre, admin) está en la colección `usuarios`, con UID como ID del documento.
- Se emplea `sessionStorage` para mantener la sesión.

---

## 📂 Estructura de Firestore

### 🔸 Nivel raíz:

```
/usuarios
/2025_eventos
/2024_eventos
...
```

### 🔸 Dentro de cada colección `{año}_eventos`:

```
/{evento}
  /modalidad
    /{modalidad}
      /equipos
        /{idEquipo}
```

---

## 📄 Ejemplo de documento en `equipos`

```json
{
  "Nombre": "Robotec",
  "Institucion": "ITSPP",
  "Asesor": "Ing. Pérez",
  "Categoria": "Universidad",
  "Contacto": "+52 638 123 4567",
  "Integrantes": [
    "Luis Pablo",
    "Brandon Jesús",
    "Zugey Lizbeth",
    "Dania Guadalupe"
  ]
}
```

---

## 🔧 Funciones principales (`consultas.js`)

### `obtenerAños()`
Devuelve una lista de años desde 2000 hasta el actual.

### `obtenerEventos(año)`
Consulta `${año}_eventos` y devuelve los eventos como `programacion`, `robotica`, etc.

### `obtenerModalidades(año, evento)`
Consulta `/modalidad` dentro del evento seleccionado.

### `obtenerEquipos(año, evento, modalidad)`
Consulta la subcolección `equipos` de la modalidad correspondiente.

---

## 🔄 Flujo funcional

1. Se selecciona un año y se cargan sus eventos.
2. Al elegir un evento, se listan sus modalidades.
3. Al elegir modalidad y presionar "Buscar", se muestran los equipos registrados.
4. Los equipos se muestran en tarjetas dinámicas (incluye lista de integrantes desde array).

---

## 🔒 Reglas de seguridad (recomendadas)

- Solo usuarios autenticados pueden leer y escribir.
- Solo `admin` puede eliminar o ver todos los usuarios.
- Usuarios no autenticados no pueden acceder.

---
