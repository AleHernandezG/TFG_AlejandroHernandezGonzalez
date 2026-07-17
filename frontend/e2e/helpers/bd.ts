import { MongoClient } from 'mongodb'

const URI = 'mongodb://127.0.0.1:27018/cookr-e2e'

export function correoUnico(prefijo = 'e2e'): string {
  return `${prefijo}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}@cookr.dev`
}

async function conBD<T>(fn: (db: import('mongodb').Db) => Promise<T>): Promise<T> {
  const cliente = new MongoClient(URI)
  try {
    await cliente.connect()
    return await fn(cliente.db())
  } finally {
    await cliente.close()
  }
}

export function tokenDeVerificacion(correo: string): Promise<string> {
  return conBD(async (db) => {
    const usuario = await db.collection('usuarios').findOne({ correo })
    if (!usuario) throw new Error(`No existe el usuario ${correo} en la base E2E`)

    const token = await db
      .collection('tokens')
      .findOne({ userId: usuario._id, tipo: 'verificacion' }, { sort: { creadoEn: -1 } })

    if (!token) throw new Error(`No hay token de verificación para ${correo}`)
    return token.token as string
  })
}

export function contarRecetasDe(correo: string): Promise<number> {
  return conBD(async (db) => {
    const usuario = await db.collection('usuarios').findOne({ correo })
    if (!usuario) return 0
    return db.collection('recetas').countDocuments({ autorId: usuario._id })
  })
}
