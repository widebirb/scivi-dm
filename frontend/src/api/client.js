import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


// default settings for requests
const client = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

// catch responses to identify different errors 
client.interceptors.response.use(
    (res) => res,
    (err) => {
        const message =
            err.response?.data?.detail || err.message || "Unknown error";
        return Promise.reject(new Error(message));
    }
);

export async function generate(parameters) {
    const { data } = await client.post("/generate", { parameters });
    return data;
}

export async function inpaint(image, mask, parameters, inpaintParams) {
    const { data } = await client.post("/inpaint", {
        image,
        mask,
        parameters,
        inpaint_params: inpaintParams,
    });
    return data;
}

export async function checkHealth() {
    const { data } = await client.get("/health");
    return data;
}