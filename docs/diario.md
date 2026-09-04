# Diario de trabajo

Una entrada por sesión, de arriba abajo la más reciente primero. Tres cosas en cada una: qué se
hizo, qué decisión costó tomar y qué queda a medias. Sirve para que la sesión de dentro de tres
semanas no reconstruya el razonamiento desde el `git log`.

---

## 2026-09-04 · Auditoría completa y plan de trabajo

**Qué se hizo.** Auditoría del repositorio entero antes de seguir tocando nada. Se comprobó
ejecutando, no leyendo: lint y tipos limpios en los dos paquetes, 80 de 80 tests en verde, cero
secretos en el historial completo, `develop` y `main` al mismo commit. Encima de esa base salieron
25 hallazgos: 1 crítico, 6 altos, 10 medios y 8 bajos.

El crítico es que `POST /api/auth/google` no verifica nada. Acepta `googleId` y `correo` en el
cuerpo y devuelve un JWT de 7 días, así que con el correo de cualquier usuario se entra en su
cuenta; y si la cuenta era local con contraseña, además la vincula al `googleId` recibido. Está en
producción.

Cuatro documentos nuevos: `AUDITORIA-2026-09.md` (hallazgos con fichero, línea y arreglo),
`PLAN-2026-09.md` (bloques F0 y F6 a F12 con criterio de cierre comprobable), `METODO-COOKR.md`
(qué se coge del método de DietMetric y qué no) y `README.md` como índice de `docs/`, que tenía 44
documentos sin nada que dijera cuál seguía vigente.

**Qué decisión costó.** El correo. El plan de julio era comprar un dominio y alinearlo en Mailjet;
se descarta y se envía desde Gmail asumiendo que Outlook y Hotmail lo descartan en silencio por
DMARC. La decisión es consciente, pero arrastra una condición que no se puede olvidar: la
demostración de la defensa tiene que hacerse con una cuenta de Gmail.

La otra: no implementar ningún arreglo en esta sesión. El encargo era auditar y planificar antes
de seguir, y mezclarlo habría dejado el diagnóstico a medias.

**Qué queda a medias.** Todo el plan. Lo siguiente es el bloque F6 (seguridad) entero, empezando
por verificar el `id_token` de Google. El frontend ya tiene el token disponible en
`auth.ts:103` y manda `providerAccountId` en su lugar.

Sin cerrar tampoco: los cinco ADR de F10.4, uno de ellos el del correo que se decidió hoy; y
`TFG-DOcumenatacion/` y `ODCUTGF/` siguen fuera del control de versiones (el `.pptx` se descarta,
no importa).

Se instalaron los plugins `security-guidance`, `code-review`, `commit-commands` y `skill-creator`,
con la lista de permisos de F11. `typescript-lsp`, `context7` y `playwright` ya estaban activos a
nivel global.
