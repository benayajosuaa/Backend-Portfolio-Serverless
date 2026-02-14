import { getPrisma } from "../lib/prisma";

type StatusWork = "Draft" | "Published";

export interface WorkInput {
  title: string;
  excerpt: string;
  cover_image: string;
  github_url?: string;
  demo_url?: string;
  drive_url?: string;
  published_at?: Date;
  status: StatusWork;
  order_index: number;
}

export const WorkServices = {
  async getAll() {
    return getPrisma().works.findMany({
      orderBy: { order_index: "asc" },
    });
  },

  async getById(id: number) {
    return getPrisma().works.findUnique({
      where: { id },
    });
  },

  async create(data: WorkInput) {
    return getPrisma().works.create({
      data,
    });
  },

  async update(id: number, data: Partial<WorkInput>) {
    return getPrisma().works.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return getPrisma().works.delete({
      where: { id },
    });
  },
};
