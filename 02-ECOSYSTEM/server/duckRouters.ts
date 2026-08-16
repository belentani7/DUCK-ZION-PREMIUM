/**
 * Duck Zion Ecosystem Router & Audio API
 * System Architecture & Mastering Engineering by Pedro Belentani
 * Canal Zion · Duck Zion Premium Edition 2026
 */
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { tracks, projects, auditLogs } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

export const INITIAL_TRACKS = [
  { id: 1, title: "Posturadona", artist: "Luiz Cinnamon", genre: "pop", credits: "I, Gr, M, MA", bpm: 104, duration: "2:45", isSingle: 0 },
  { id: 2, title: "Tititi", artist: "Leones", genre: "pop", credits: "I, Gr, M, MA", bpm: 100, duration: "3:10", isSingle: 0 },
  { id: 3, title: "De Fininho", artist: "Leones", genre: "pop", credits: "I, Gr, M, MA", bpm: 98, duration: "2:55", isSingle: 0 },
  { id: 4, title: "Te Pegar", artist: "Leones", genre: "pop", credits: "I, Gr, M, MA", bpm: 102, duration: "3:02", isSingle: 0 },
  { id: 5, title: "Me Deseja em Segredo", artist: "Leones", genre: "pop", credits: "I, Gr, M, MA", bpm: 95, duration: "3:20", isSingle: 0 },
  { id: 6, title: "Abstinência", artist: "Leones", genre: "pop", credits: "I, Gr, M, MA", bpm: 92, duration: "3:15", isSingle: 0 },
  { id: 7, title: "I Wrote a Song", artist: "Belentani", genre: "pop", credits: "I, M, MA", bpm: 110, duration: "2:40", isSingle: 0 },
  { id: 8, title: "Cheguei Tão Longe", artist: "Leones ft. Chrislops", genre: "pop", credits: "I, Gr, M, MA", bpm: 105, duration: "3:30", isSingle: 0 },
  { id: 9, title: "LOVE ME (1170V)", artist: "Mayzer Gafur Menm", genre: "pop", credits: "I, M, MA", bpm: 100, duration: "3:12", isSingle: 0 },
  { id: 10, title: "GUN (1020V)", artist: "Mayzer Gafur Menm", genre: "pop", credits: "I, M, MA", bpm: 130, duration: "2:24", isSingle: 0 },
  { id: 11, title: "Quem Manda Sou Eu", artist: "Leones", genre: "pop", credits: "I, Gr, M, MA", bpm: 98, duration: "3:05", isSingle: 0 },
  { id: 12, title: "Contra a Parede", artist: "Jullya Murvack", genre: "pop", credits: "Gr, M, MA", bpm: 102, duration: "2:50", isSingle: 0 },
  { id: 13, title: "Gostosa", artist: "Emmie Reek", genre: "pop", credits: "I, M, MA", bpm: 106, duration: "2:58", isSingle: 0 },
  { id: 14, title: "Heart Breaking", artist: "Belentani", genre: "pop", credits: "I, M, MA", bpm: 90, duration: "3:25", isSingle: 0 },
  { id: 15, title: "Louco", artist: "Leones", genre: "pop", credits: "I, Gr, M, MA", bpm: 112, duration: "2:45", isSingle: 0 },
  { id: 16, title: "Desce Sobe", artist: "Chrislops ft. Soy Guchi", genre: "pop", credits: "Gr, M, MA", bpm: 120, duration: "2:35", isSingle: 0 },
  { id: 17, title: "Baila Conmigo", artist: "Belentani", genre: "pop", credits: "I, M, MA", bpm: 108, duration: "2:50", isSingle: 0 },
  { id: 18, title: "Therapist", artist: "Belentani", genre: "pop", credits: "I, M, MA", bpm: 88, duration: "3:40", isSingle: 0 },
  { id: 19, title: "Sleep Talking", artist: "Belentani", genre: "pop", credits: "I, M, MA", bpm: 85, duration: "3:50", isSingle: 0 },
  { id: 20, title: "Lento", artist: "Belentani", genre: "pop", credits: "I, M, MA", bpm: 84, duration: "3:36", isSingle: 0 },
  { id: 21, title: "Eu Que Mando", artist: "Duck4x", genre: "pop", credits: "Pr", bpm: 100, duration: "2:41", isSingle: 1 },
  { id: 22, title: "Gostosa", artist: "Duck4x", genre: "pop", credits: "Pr", bpm: 106, duration: "2:58", isSingle: 1 },
  { id: 23, title: "Love Me", artist: "Duck4x", genre: "pop", credits: "Pr", bpm: 90, duration: "3:12", isSingle: 1 },
  { id: 24, title: "One RPM", artist: "Duck4x", genre: "pop", credits: "Pr", bpm: 142, duration: "2:24", isSingle: 1 },
  { id: 25, title: "Capa Brilho do Luar", artist: "Duck4x", genre: "pop", credits: "Pr", bpm: 84, duration: "3:36", isSingle: 1 },
  { id: 26, title: "Ouro Rosê", artist: "Dayo", genre: "trap", credits: "Gr, M, MA", bpm: 140, duration: "2:30", isSingle: 0 },
  { id: 27, title: "Money Way", artist: "Dlok", genre: "trap", credits: "Gr, M, MA", bpm: 145, duration: "2:20", isSingle: 0 },
  { id: 28, title: "Progresso", artist: "Thysoul", genre: "trap", credits: "Gr, M, MA", bpm: 138, duration: "2:45", isSingle: 0 },
  { id: 29, title: "Rei do Jogo", artist: "Thysoul", genre: "trap", credits: "I, Gr, M, MA", bpm: 142, duration: "2:50", isSingle: 0 },
  { id: 30, title: "Quando Ela Desce", artist: "Kvyn MC", genre: "trap", credits: "I, Gr, M, MA", bpm: 135, duration: "3:00", isSingle: 0 },
  { id: 31, title: "Yakuza", artist: "Kvyn MC", genre: "trap", credits: "I, Gr, M, MA", bpm: 148, duration: "2:15", isSingle: 0 },
  { id: 32, title: "Que Deus Me Proteja", artist: "Kvyn MC", genre: "trap", credits: "I, Gr, M, MA", bpm: 130, duration: "3:10", isSingle: 0 },
  { id: 33, title: "Telefone", artist: "NK ft. Duck", genre: "trap", credits: "I, Gr, M, MA", bpm: 140, duration: "2:40", isSingle: 0 },
  { id: 34, title: "Mohamed", artist: "Waave ft. Duck", genre: "trap", credits: "Gr, M, MA", bpm: 144, duration: "2:25", isSingle: 0 },
  { id: 35, title: "EP Veneno", artist: "Duck", genre: "trap", credits: "I, Gr, M, MA", bpm: 142, duration: "12:00", isSingle: 0 },
  { id: 36, title: "Preju", artist: "Duck", genre: "trap", credits: "Gr, M, MA", bpm: 136, duration: "2:50", isSingle: 0 },
  { id: 37, title: "Atiro no Escuro", artist: "Santa Cena", genre: "trap", credits: "Gr, M, MA", bpm: 140, duration: "2:40", isSingle: 0 },
  { id: 38, title: "Pega a Visão", artist: "Santa Cena", genre: "trap", credits: "Gr, M, MA", bpm: 142, duration: "2:35", isSingle: 0 },
  { id: 39, title: "Brilho do Luar", artist: "Pedro Henry", genre: "trap", credits: "I, Gr, M, MA", bpm: 84, duration: "3:36", isSingle: 0 },
  { id: 40, title: "Eu Não Tô Aqui Pra Fazer Média", artist: "Hancornia", genre: "mpb", credits: "I, Gr, M, MA", bpm: 80, duration: "3:45", isSingle: 0 },
  { id: 41, title: "EP Hancornia", artist: "Hancornia", genre: "mpb", credits: "I, Gr, M, MA", bpm: 82, duration: "14:20", isSingle: 0 },
];

async function seedTracksIfNeeded() {
  const db = await getDb();
  if (!db) return;
  try {
    const existing = await db.select().from(tracks).limit(1);
    if (existing.length === 0) {
      for (const t of INITIAL_TRACKS) {
        const { id, ...trackData } = t;
        await db.insert(tracks).values(trackData);
      }
    }
  } catch (err) {
    console.warn("[DuckRouter] Seed error (fallback active):", err);
  }
}

seedTracksIfNeeded().catch(console.error);

export const duckRouter = router({
  getTracks: publicProcedure
    .input(z.object({ genre: z.string().optional(), search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      let allTracks: any[] = [];
      const db = await getDb();
      if (db) {
        try {
          allTracks = await db.select().from(tracks).orderBy(desc(tracks.id));
        } catch {
          allTracks = INITIAL_TRACKS;
        }
      } else {
        allTracks = INITIAL_TRACKS;
      }
      return allTracks.filter(t => {
        if (input?.genre && input.genre !== 'all' && t.genre !== input.genre) return false;
        if (input?.search) {
          const q = input.search.toLowerCase();
          return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
        }
        return true;
      });
    }),

  getSingles: publicProcedure.query(async () => {
    const db = await getDb();
    if (db) {
      try {
        const res = await db.select().from(tracks).where(eq(tracks.isSingle, 1));
        if (res.length > 0) return res;
      } catch {}
    }
    return INITIAL_TRACKS.filter(t => t.isSingle === 1);
  }),

  getProjects: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      return await db.select().from(projects).orderBy(desc(projects.createdAt));
    } catch {
      return [];
    }
  }),

  createProject: protectedProcedure
    .input(z.object({
      title: z.string(),
      clientName: z.string(),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
      genre: z.string(),
      budget: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(projects).values({
        title: input.title,
        clientName: input.clientName,
        clientEmail: input.clientEmail || null,
        clientPhone: input.clientPhone || null,
        genre: input.genre,
        budget: input.budget ? String(input.budget) : null,
        notes: input.notes || null,
      });
      await db.insert(auditLogs).values({
        action: "PROJECT_CREATED",
        details: `Proyecto '${input.title}' creado para ${input.clientName}`,
      });
      await notifyOwner({
        title: "Nuevo Proyecto",
        content: `🎵 Nuevo Proyecto - Duck: ${input.title} (${input.clientName})`,
      });
      return { success: true };
    }),

  updateProjectStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["briefing", "recording", "mixing", "mastering", "delivered"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(projects).set({ status: input.status }).where(eq(projects.id, input.id));
      await db.insert(auditLogs).values({
        action: "PROJECT_STATUS_UPDATED",
        details: `Proyecto ID ${input.id} cambiado a estado ${input.status}`,
      });
      return { success: true };
    }),

  getAuditLogs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(50);
  }),

  aiChat: publicProcedure
    .input(z.object({
      message: z.string(),
      language: z.string().default("pt"),
      history: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() })).optional(),
    }))
    .mutation(async ({ input }) => {
      const langNames: Record<string, string> = {
        pt: "Português",
        es: "Español",
        en: "English",
        fr: "Français",
        it: "Italiano",
      };
      const lang = langNames[input.language] || "Português";

      const systemPrompt = `Eres el asistente oficial de IA sin API externa (corriendo en el ecosistema local de Duck), un productor musical de Aracaju, Sergipe, Brasil. Tu nombre artístico es Duck (Duck4x), activo desde 2012 (13 años de experiencia), con más de 36 millones de streams, 40+ lanzamientos y 41+ tracks catalogados. Especialidades: Beatmaking, Mixagem, Masterização. Géneros: Trap, Pop, Pop BR, MPB, HipHop. Contacto: @duck4s (Instagram), duck-beats@hotmail.com, WhatsApp +55 79 99602-6590. Tienes sinestesia musical ("ves la música"). Participa en el colectivo @check_match. 
      Responde SIEMPRE en el idioma solicitado: ${lang}. 
      Sé profesional, técnico pero a la vez divertido, apasionado por el sonido, y cuando el usuario hable de colaboraciones, contrataciones o beatmaking, invítale amablemente a contactar por WhatsApp o email con Duck.`;

      try {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...(input.history || []),
            { role: "user", content: input.message },
          ] as any,
        });
        const replyText = typeof result === "string" ? result : JSON.stringify(result);
        return { reply: replyText };
      } catch (err) {
        const fallbacks: Record<string, string> = {
          pt: "E aí! Aqui é o assistente virtual do Duck (Duck4x). O Duck está no estúdio ajustando os 808s e polindo o próximo hit em Aracaju. Com mais de 36M de streams e 13 anos de beatmaking, mixagem e masterização, ele transforma frequências em pura emoção! Quer mandar um som ou fechar um beat? Fala direto com ele no WhatsApp: +55 79 99602-6590 ou manda um email para duck-beats@hotmail.com!",
          es: "¡Qué tal! Soy el asistente virtual de Duck (Duck4x). Duck está ahora mismo en el estudio ajustando los 808s y puliendo el próximo hit en Aracaju, Sergipe. Con más de 36M de streams y 13 años de experiencia en beatmaking, mezcla y masterización, ¡su sinestesia musical hace que vea la música! ¿Quieres colaborar o encargar un beat? Escríbele al WhatsApp +55 79 99602-6590 o a duck-beats@hotmail.com.",
          en: "Hey! I'm Duck's (Duck4x) virtual assistant. Duck is currently in the studio shaping 808s and polishing the next hit in Aracaju, Brazil. With 36M+ streams and 13 years in beatmaking, mixing, and mastering, his musical synesthesia turns sound into vision! Want to collaborate or grab a beat? Reach out on WhatsApp +55 79 99602-6590 or email duck-beats@hotmail.com.",
          fr: "Salut ! Je suis l'assistant virtuel de Duck (Duck4x). Duck est en studio à Aracaju. Avec plus de 36M de streams et 13 ans d'expérience en beatmaking, mixage et mastering, sa synesthésie musicale transforme le son en vision ! Contacte-le sur WhatsApp +55 79 99602-6590 ou par email à duck-beats@hotmail.com.",
          it: "Ciao! Sono l'assistente virtuale di Duck (Duck4x). Duck è in studio ad Aracaju. Con oltre 36M di stream e 13 anni di esperienza nel beatmaking, mix e mastering, la sinestesia musicale trasforma il suono in visione! Contattalo su WhatsApp +55 79 99602-6590 o via email a duck-beats@hotmail.com.",
        };
        return { reply: fallbacks[input.language] || fallbacks.pt };
      }
    }),
});
