// utils/fetch.ts

import { supabase } from "../../supabase/client";


export const createTask = async (task: {
  user_id: string;
  title: string;
  description?: string;
  status?: string;
  extras?: object;
}) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert([task]);

  if (error) {
    console.error("Error creating task:", error.message);
    return null;
  }

  return data;
};
