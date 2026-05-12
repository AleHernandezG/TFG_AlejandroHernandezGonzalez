import { Types } from "mongoose";
import { Usuario } from "../models/usuarioMongo";
import { IItemDespensa } from "../types/despensa";

function notFound(): never {
  throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
}

export const despensaRepository = {
  async obtener(usuarioId: string): Promise<IItemDespensa[]> {
    const usuario = await Usuario.findById(usuarioId).select("despensa");
    if (!usuario) notFound();
    return usuario.despensa ?? [];
  },

  async añadir(
    usuarioId: string,
    item: Omit<IItemDespensa, "_id">,
  ): Promise<IItemDespensa[]> {
    const usuario = await Usuario.findByIdAndUpdate(
      usuarioId,
      { $push: { despensa: item } },
      { new: true },
    ).select("despensa");
    if (!usuario) notFound();
    return usuario.despensa ?? [];
  },

  async editar(
    usuarioId: string,
    itemId: string,
    cambios: Partial<Omit<IItemDespensa, "_id">>,
  ): Promise<IItemDespensa[]> {
    if (!Types.ObjectId.isValid(itemId)) {
      throw Object.assign(new Error("Item no encontrado"), { status: 404 });
    }

    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(cambios)) {
      update[`despensa.$.${key}`] = value;
    }

    const usuario = await Usuario.findOneAndUpdate(
      { _id: usuarioId, "despensa._id": new Types.ObjectId(itemId) },
      { $set: update },
      { new: true },
    ).select("despensa");

    if (!usuario) notFound();
    return usuario.despensa ?? [];
  },

  async eliminar(usuarioId: string, itemId: string): Promise<IItemDespensa[]> {
    if (!Types.ObjectId.isValid(itemId)) {
      throw Object.assign(new Error("Item no encontrado"), { status: 404 });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      usuarioId,
      { $pull: { despensa: { _id: new Types.ObjectId(itemId) } } },
      { new: true },
    ).select("despensa");

    if (!usuario) notFound();
    return usuario.despensa ?? [];
  },
};
