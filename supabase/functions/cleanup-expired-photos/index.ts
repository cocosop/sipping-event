import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: expiredPhotos, error: fetchError } = await supabase
      .from("photos")
      .select("id, storage_path")
      .lt("expires_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!expiredPhotos || expiredPhotos.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired photos found", deleted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const storagePaths = expiredPhotos.map((p: { storage_path: string }) => p.storage_path);
    const photoIds = expiredPhotos.map((p: { id: string }) => p.id);

    const { error: storageError } = await supabase.storage
      .from("event-photos")
      .remove(storagePaths);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
    }

    const { error: dbError } = await supabase
      .from("photos")
      .delete()
      .in("id", photoIds);

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({
        message: `Cleaned up ${expiredPhotos.length} expired photos`,
        deleted: expiredPhotos.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: "Cleanup failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
