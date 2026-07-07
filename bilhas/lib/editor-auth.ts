export function isEditorAuthorized(request: Request) {
  const editorSecret = process.env.EDITOR_SECRET;
  const syncSecret = process.env.SYNC_SECRET;
  const secret = editorSecret ?? syncSecret;

  if (process.env.NODE_ENV !== "production" && !secret) return true;
  if (!secret) return false;

  const editorHeader = request.headers.get("x-bilhas-editor-secret");
  const authHeader = request.headers.get("authorization");

  return editorHeader === secret || authHeader === `Bearer ${secret}`;
}
