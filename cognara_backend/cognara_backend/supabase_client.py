from supabase import create_client
import os

SUPABASE_URL = "https://rhwwleuleeqmngoesjos.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJod3dsZXVsZWVxbW5nb2Vzam9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA5MTk4NywiZXhwIjoyMDY2NjY3OTg3fQ.ViRtG74m4sLPAB6BtaVqC7pA2gvkUTgh6ngt6sy8OkY"
SUPABASE_BUCKET = "assets"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_image_to_supabase(local_path: str, storage_path: str):
    with open(local_path, "rb") as f:
        response = supabase.storage.from_(SUPABASE_BUCKET).update(storage_path, f, {"content-type": "image/png"})

        # ✅ check if the upload failed
        if response.error:
            raise Exception(f"Upload failed: {response.error.message}")

        # ✅ get the public URL
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(storage_path)
        return public_url