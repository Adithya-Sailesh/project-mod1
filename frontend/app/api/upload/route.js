export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const backendResponse = await fetch("http://127.0.0.1:5000/process-video", {
      method: "POST",
      body: formData,
    });

    const contentType = backendResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await backendResponse.text();
      throw new Error(`Backend returned an invalid response: ${text}`);
    }

    const data = await backendResponse.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error uploading file to backend:", error);
    return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}