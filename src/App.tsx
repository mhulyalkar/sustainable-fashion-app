import { useState } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setFabric(null);
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:3001/classify-fabric", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data = await res.json();
      setFabric(data.fabric || "Unknown Fabric");
    } catch (err: any) {
      console.error(err);
      setError("Error classifying fabric. Try again.");
      setFabric(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (fabric) navigator.clipboard.writeText(fabric);
  };

  return (
    <div className="app">
      <h1>Sustainable Fashion App</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {image && (
        <div className="preview">
          <img src={image} alt="Uploaded preview" style={{ maxWidth: "300px" }} />
          {loading && <p>Classifying fabric...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {fabric && (
            <>
              <p>
                <strong>Predicted Fabric:</strong> {fabric}
              </p>
              <button onClick={copyToClipboard}>Copy fabric type</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
