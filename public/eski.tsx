/*"use client"
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

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const sortTodos = (list: Todo[]) =>
    [...list].sort((a, b) => {
      if (a.done === b.done) return 0;
      return a.done ? 1 : -1; // done=false üstte
    });

  const fetchTodos = async (userId: string) => {
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("done", { ascending: true })
      .order("inserted_at", { ascending: true });

    if (data) {
      setTodos(
        data.map((row: any) => ({
          id: row.id,
          title: row.title,
          done: row.done,
        }))
      );
    }
  };

  const addTodo = async () => {
    if (!input.trim() || !user) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("todos")
      .insert({ title: input.trim(), user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setTodos((prev) =>
        sortTodos([...prev, { id: data.id, title: data.title, done: data.done }])
      );
      setInput("");
    }
    setSaving(false);
  };

  const toggleTodo = async (todo: Todo) => {
    if (!user) return;
    const nextDone = !todo.done;

    await supabase
      .from("todos")
      .update({ done: nextDone })
      .eq("id", todo.id)
      .eq("user_id", user.id);

    setTodos((prev) =>
      sortTodos(prev.map((t) => (t.id === todo.id ? { ...t, done: nextDone } : t)))
    );
  };

  const deleteTodo = async (todo: Todo) => {
    if (!user) return;

    await supabase.from("todos").delete().eq("id", todo.id).eq("user_id", user.id);

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
    if (!user) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;

    if (trimmed === todo.title) {
      cancelEdit();
      return;
    }

    const { error } = await supabase
      .from("todos")
      .update({ title: trimmed })
      .eq("id", todo.id)
      .eq("user_id", user.id);

    if (!error) {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, title: trimmed } : t)));
      cancelEdit();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTodos([]);
    cancelEdit();
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
          "radial-gradient(circle at top, #1f2933 0, #020617 40%, #000 100%)",
        color: "#f9fafb",
      }}
    >
      {initialLoading ? (
        <Typography sx={{ color: "#facc15" }}>Yükleniyor...</Typography>
      ) : !user ? (
        <Card
          sx={{
            width: 380,
            maxWidth: "100%",
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(250,204,21,0.35)",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(0,0,0,0.96))",
            boxShadow:
              "0 0 30px rgba(0,0,0,0.9), 0 0 60px rgba(250,204,21,0.05)",
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#facc15",
              opacity: 0.9,
            }}
          >
            LUX TODO
          </Typography>

          <Typography sx={{ mt: 1, fontSize: 24, fontWeight: 800 }}>
            Görevlerini Lüks Bir Şekilde Yönet
          </Typography>

          <Typography sx={{ mt: 1, fontSize: 13, opacity: 0.8 }}>
            Devam etmek için giriş yap. Her kullanıcının listesi ona özel.
          </Typography>

          <Button
            href="/auth"
            variant="contained"
            sx={{
              mt: 2,
              borderRadius: 999,
              fontWeight: 800,
              color: "#111827",
              background:
                "linear-gradient(135deg, #facc15, #eab308, #fbbf24)",
              boxShadow: "0 14px 30px rgba(250,204,21,0.4)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #facc15, #eab308, #fbbf24)",
                opacity: 0.95,
              },
            }}
          >
            Giriş Yap
          </Button>
        </Card>
      ) : (
        <Card
          sx={{
            width: 520,
            maxWidth: "100%",
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(250,204,21,0.4)",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(0,0,0,0.98))",
            boxShadow:
              "0 0 30px rgba(0,0,0,0.9), 0 0 60px rgba(250,204,21,0.06)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "#facc15",
                  opacity: 0.9,
                }}
              >
                LUX TODO
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 22, fontWeight: 900 }}>
                Hoşgeldin
              </Typography>

              <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                {user.email}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={`Toplam: ${todos.length}`}
                  sx={{ bgcolor: "rgba(15,23,42,0.9)", color: "#e5e7eb", border: "1px solid rgba(148,163,184,0.35)" }}
                />
                <Chip
                  size="small"
                  label={`Bitti: ${doneCount}`}
                  sx={{ bgcolor: "rgba(15,23,42,0.9)", color: "#facc15", border: "1px solid rgba(250,204,21,0.35)" }}
                />
              </Stack>
            </Box>

            <Button
              onClick={logout}
              variant="outlined"
              startIcon={<LogoutIcon />}
              sx={{
                borderRadius: 999,
                borderColor: "rgba(148,163,184,0.7)",
                color: "#e5e7eb",
                "&:hover": {
                  borderColor: "rgba(250,204,21,0.6)",
                },
              }}
            >
              Çıkış
            </Button>
          </Stack>

          <Divider sx={{ my: 2, borderColor: "rgba(148,163,184,0.25)" }} />

          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.35)",
            }}
          >
            <Typography sx={{ fontSize: 12, opacity: 0.85, mb: 1 }}>
              Yeni görev ekle
            </Typography>

            <Stack direction="row" spacing={1}>
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Örn: Sabah antrenmanı, proje teslimi..."
                size="small"
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo();
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    bgcolor: "rgba(15,23,42,0.9)",
                    color: "#e5e7eb",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(148,163,184,0.6)",
                  },
                }}
              />

              <Button
                onClick={addTodo}
                disabled={saving}
                variant="contained"
                sx={{
                  borderRadius: 999,
                  fontWeight: 900,
                  color: "#111827",
                  background:
                    "linear-gradient(135deg, #facc15, #eab308, #fbbf24)",
                  boxShadow: "0 10px 22px rgba(250,204,21,0.35)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #facc15, #eab308, #fbbf24)",
                    opacity: 0.95,
                  },
                  whiteSpace: "nowrap",
                }}
              >
                {saving ? "Kaydediliyor..." : "Ekle"}
              </Button>
            </Stack>
          </Card>

          <Box sx={{ mt: 2 }}>
            {todos.length === 0 ? (
              <Typography sx={{ fontSize: 13, opacity: 0.75, textAlign: "center", py: 2 }}>
                Henüz görevin yok. Hadi bir tane ekle ✨
              </Typography>
            ) : (
              <Stack spacing={1} sx={{ maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
                {todos.map((todo) => {
                  const isEditing = editingId === todo.id;

                  return (
                    <Card
                      key={todo.id}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        background: "rgba(15,23,42,0.95)",
                        border: "1px solid rgba(30,64,175,0.6)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        onClick={() => toggleTodo(todo)}
                        size="small"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          border: todo.done
                            ? "none"
                            : "1px solid rgba(148,163,184,0.6)",
                          bgcolor: todo.done ? "rgba(250,204,21,0.95)" : "transparent",
                          color: todo.done ? "#111827" : "#e5e7eb",
                          "&:hover": {
                            bgcolor: todo.done
                              ? "rgba(250,204,21,0.85)"
                              : "rgba(148,163,184,0.10)",
                          },
                        }}
                      >
                        {todo.done ? <CheckIcon fontSize="small" /> : <span />}
                      </IconButton>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {isEditing ? (
                          <TextField
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            size="small"
                            fullWidth
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(todo);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 999,
                                bgcolor: "rgba(2,6,23,0.7)",
                                color: "#e5e7eb",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(148,163,184,0.6)",
                              },
                            }}
                          />
                        ) : (
                          <Typography
                            onClick={() => toggleTodo(todo)}
                            sx={{
                              cursor: "pointer",
                              color: "#e5e7eb",
                              fontSize: 14,
                              textDecoration: todo.done ? "line-through" : "none",
                              opacity: todo.done ? 0.55 : 0.95,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={todo.title}
                          >
                            {todo.title}
                          </Typography>
                        )}
                      </Box>

                      {isEditing ? (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            onClick={() => saveEdit(todo)}
                            size="small"
                            sx={{
                              bgcolor: "rgba(250,204,21,0.95)",
                              color: "#111827",
                              "&:hover": { bgcolor: "rgba(250,204,21,0.85)" },
                            }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={cancelEdit}
                            size="small"
                            sx={{
                              border: "1px solid rgba(148,163,184,0.6)",
                              color: "#e5e7eb",
                              "&:hover": { bgcolor: "rgba(148,163,184,0.10)" },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            onClick={() => startEdit(todo)}
                            size="small"
                            sx={{
                              border: "1px solid rgba(148,163,184,0.6)",
                              color: "#e5e7eb",
                              "&:hover": { bgcolor: "rgba(148,163,184,0.10)" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            onClick={() => deleteTodo(todo)}
                            size="small"
                            sx={{
                              bgcolor: "rgba(127,29,29,0.9)",
                              color: "#fee2e2",
                              "&:hover": { bgcolor: "rgba(127,29,29,0.75)" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
}*/