import { despensaRepository } from "../repositories/despensaRepository";
import { IItemDespensa } from "../types/despensa";

export const despensaService = {
  obtener: (usuarioId: string) =>
    despensaRepository.obtener(usuarioId),

  añadir: (
    usuarioId: string,
    item: Omit<IItemDespensa, "_id">,
  ) => despensaRepository.añadir(usuarioId, item),

  añadirLote: (
    usuarioId: string,
    items: Omit<IItemDespensa, "_id">[],
  ) => despensaRepository.añadirLote(usuarioId, items),

  editar: (
    usuarioId: string,
    itemId: string,
    cambios: Partial<Omit<IItemDespensa, "_id">>,
  ) => despensaRepository.editar(usuarioId, itemId, cambios),

  eliminar: (usuarioId: string, itemId: string) =>
    despensaRepository.eliminar(usuarioId, itemId),

  vaciar: (usuarioId: string) =>
    despensaRepository.vaciar(usuarioId),
};
