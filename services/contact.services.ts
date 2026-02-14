import { getPrisma } from "../lib/prisma";
import { sendEmail } from "../lib/mailer";

type StatusContact = "Unread" | "Read" | "Replied" | "Archived";

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const ContactService = {
  async create(data: ContactInput) {
    return getPrisma().contact_messages.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        subject: data.subject,
        message: data.message,
        status: "Unread",
      },
    });
  },

  async getAll() {
    return getPrisma().contact_messages.findMany({
      orderBy: { created_at: "desc" },
    });
  },

  async getById(id: number) {
    return getPrisma().contact_messages.findUnique({
      where: { id },
    });
  },

  async delete(id: number) {
    return getPrisma().contact_messages.delete({
      where: { id },
    });
  },

  async reply(id: number, markdown: string) {
    const contact = await getPrisma().contact_messages.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new Error("contact not found");
    }

    await sendEmail(contact.email, `Re: ${contact.subject}`, markdown);

    return getPrisma().contact_messages.update({
      where: { id },
      data: {
        status: "Replied",
      },
    });
  },

  async updateStatus(id: number, status: StatusContact) {
    return getPrisma().contact_messages.update({
      where: { id },
      data: { status },
    });
  },
};
