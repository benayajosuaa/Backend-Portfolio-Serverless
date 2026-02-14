import { getPrisma } from "../lib/prisma";

type TypeJourney = "Education" | "Work" | "Organization";

export interface JourneyInput {
  type: TypeJourney;
  title: string;
  excerpt: string;
  cover_image: string;
  year: number;
  content?: string;
  order_index: number;
}

export const JourneyServices = {
  async getAll() {
    return getPrisma().journeys.findMany({
      orderBy: { order_index: "asc" },
    });
  },

  async getById(id: number) {
    return getPrisma().journeys.findUnique({
      where: { id },
    });
  },

  async create(data: JourneyInput) {
    return getPrisma().journeys.create({
      data,
    });
  },

  async update(id: number, data: Partial<JourneyInput>) {
    return getPrisma().journeys.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return getPrisma().journeys.delete({
      where: { id },
    });
  },
};
