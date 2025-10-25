import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { todo as todoTable } from "@/db/schema";
import { eq } from "drizzle-orm";

async function addTodo(formData: FormData) {
  "use server";
  const db = getDb();
  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (!title) return;
  await db.insert(todoTable).values({ title });
  revalidatePath("/");
}

async function toggleTodo(formData: FormData) {
  "use server";
  const db = getDb(); 
  const id = Number(formData.get("id"));
  const nextCompleted = String(formData.get("completed")) === "true";
  if (!Number.isFinite(id)) return;
  await db.update(todoTable).set({ completed: nextCompleted }).where(eq(todoTable.id, id));
  revalidatePath("/");
}

async function deleteTodo(formData: FormData) {
  "use server";
  const db = getDb(); 
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(todoTable).where(eq(todoTable.id, id));
  revalidatePath("/");
}

export default async function Home() {
  const db = getDb(); 
  const todos = await db.select().from(todoTable).orderBy(todoTable.id);

  return (
    <div className="min-h-screen p-8 font-sans">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Todos</h1>

        <form action={addTodo} className="flex gap-2">
          <input
            type="text"
            name="title"
            placeholder="Add a todo..."
            className="w-full rounded border px-3 py-2"
          />
          <button type="submit" className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
            Add
          </button>
        </form>

        <ul className="space-y-2">
          {todos.length === 0 ? (
            <li className="text-sm text-gray-500">No todos yet.</li>
          ) : (
            todos.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded border p-2">
                <div className={t.completed ? "line-through text-gray-500" : ""}>{t.title}</div>
                <div className="flex items-center gap-2">
                  <form action={toggleTodo}>
                    <input type="hidden" name="id" value={String(t.id)} />
                    <input type="hidden" name="completed" value={String(!t.completed)} />
                    <button type="submit" className="rounded border px-2 py-1 text-sm">
                      {t.completed ? "Undo" : "Done"}
                    </button>
                  </form>
                  <form action={deleteTodo}>
                    <input type="hidden" name="id" value={String(t.id)} />
                    <button type="submit" className="rounded border px-2 py-1 text-sm text-red-600">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
