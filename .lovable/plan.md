

## Fix: HTML lessons showing raw code instead of rendering

### Root cause
`LessonViewerDialog.tsx` uses `<iframe src={viewUrl}>` for HTML content. When the URL points to a storage bucket or static file, the browser may display the raw source instead of rendering it. The existing `InteractiveResourceViewer` already handles this correctly by fetching the HTML with `fetch()` and injecting it via `srcDoc`.

### Fix in `src/components/LessonViewerDialog.tsx`
1. Add a `htmlContent` state and a `loading` state for iframe content
2. When `viewMode` is set to `"iframe"`, fetch the HTML from the URL and store the response text
3. Replace `<iframe src={viewUrl}>` with `<iframe srcDoc={htmlContent}>` (same pattern as `InteractiveResourceViewer`)
4. Add a loading spinner while fetching

### Single file change
Only `src/components/LessonViewerDialog.tsx` needs to be modified.

