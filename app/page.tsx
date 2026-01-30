"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  IconButton,
  Stack,
  Divider,
  Chip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  /* 🔽 DONE OLANLARI EN ALTA ATAN SORT */
  const sortTodos = (list: Todo[]) =>
    [...list].sort((a, b) => {
      if (a.done === b.done) return 0;
      return a.done ? 1 : -1;
    });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) await fetchTodos(currentUser.id);
      setInitialLoading(false);
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchTodos(u.id);
      else setTodos([]);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchTodos = async (userId: string) => {
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("inserted_at", { ascending: true });

    if (data) setTodos(sortTodos(data));
  };

  const addTodo = async () => {
    if (!input.trim() || !user) return;
    setSaving(true);

    const { data } = await supabase
      .from("todos")
      .insert({ title: input.trim(), user_id: user.id })
      .select()
      .single();

    if (data) {
      setTodos((prev) =>
        sortTodos([...prev, { id: data.id, title: data.title, done: data.done }])
      );
      setInput("");
    }
    setSaving(false);
  };

  const toggleTodo = async (todo: Todo) => {
    const nextDone = !todo.done;

    await supabase
      .from("todos")
      .update({ done: nextDone })
      .eq("id", todo.id)
      .eq("user_id", user.id);

    setTodos((prev) =>
      sortTodos(
        prev.map((t) =>
          t.id === todo.id ? { ...t, done: nextDone } : t
        )
      )
    );
  };

  const deleteTodo = async (todo: Todo) => {
    await supabase.from("todos").delete().eq("id", todo.id);
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    if (editingId === todo.id) {
      setEditingId(null);
      setEditValue("");
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (todo: Todo) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;

    await supabase
      .from("todos")
      .update({ title: trimmed })
      .eq("id", todo.id);

    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, title: trimmed } : t
      )
    );
    cancelEdit();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTodos([]);
  };

  const doneCount = useMemo(() => todos.filter((t) => t.done).length, [todos]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background:
          "radial-gradient(circle at top, #0b1220 0%, #020617 45%, #020617 100%)",
        color: "#e5e7eb",
      }}
    >
      {initialLoading ? (
        <Typography>Yükleniyor...</Typography>
      ) : !user ? (
        <Card sx={{ p: 3 }}>
          <Button href="/auth" variant="contained">
            Giriş Yap
          </Button>
        </Card>
      ) : (
        <Card
          sx={{
            width: 520,
            maxWidth: "100%",
            p: 3,
            bgcolor: "#0b1220",
            border: "1px solid #1e3a8a",
          }}
        >
          {/* HEADER */}
          <Stack direction="row" justifyContent="space-between">
            <Box>
              <Typography sx={{ color: "#38bdf8", letterSpacing: 4 }}>
                LUX TODO
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip label={`Toplam: ${todos.length}`} size="small" />
                <Chip
                  label={`Bitti: ${doneCount}`}
                  size="small"
                  color="info"
                />
              </Stack>
            </Box>

            <Button
              onClick={logout}
              startIcon={<LogoutIcon />}
              variant="outlined"
            >
              Çıkış
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* ➕ ADD TODO (SİYAH YAZI) */}
          <Stack direction="row" spacing={1} mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Yeni görev yaz..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  borderRadius: 999,
                },
                "& input::placeholder": {
                  color: "#64748b",
                  opacity: 1,
                },
              }}
            />
            <Button
              onClick={addTodo}
              disabled={saving}
              variant="contained"
            >
              Ekle
            </Button>
          </Stack>

          {/* 📋 TODO LIST */}
          <Stack spacing={1}>
            {todos.map((todo) => {
              const isEditing = editingId === todo.id;

              return (
                <Card
                  key={todo.id}
                  sx={{
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#020617",
                    border: "1px solid #1e3a8a",
                  }}
                >
                  <IconButton onClick={() => toggleTodo(todo)}>
                    {todo.done && (
                      <CheckIcon sx={{ color: "#38bdf8" }} />
                    )}
                  </IconButton>

                  {isEditing ? (
                    <TextField
                      size="small"
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      sx={{ flex: 1 }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        flex: 1,
                        textDecoration: todo.done
                          ? "line-through"
                          : "none",
                        opacity: todo.done ? 0.55 : 1,
                        cursor: "pointer",
                      }}
                      onClick={() => toggleTodo(todo)}
                    >
                      {todo.title}
                    </Typography>
                  )}

                  {isEditing ? (
                    <>
                      <IconButton onClick={() => saveEdit(todo)}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton onClick={cancelEdit}>
                        <CloseIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => startEdit(todo)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => deleteTodo(todo)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Card>
              );
            })}
          </Stack>
        </Card>
      )}
    </Box>
  );
}
