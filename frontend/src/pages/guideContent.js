export const sections = [
    {
        title: "Overview",
        type: "rules",
        items: [
            "SCIVI-DM generates realistic facial composite images from text descriptions using Stable Diffusion. It is intended to assist in producing visual references for forensic and investigative use.",
            "The system has two modes. Generation (txt2img) builds an image from scratch using a structured prompt. Inpainting refines a specific region of an existing image without altering the rest.",
            "Results are non-deterministic by default. The same prompt can produce different outputs across runs unless a fixed seed is used.",
        ],
    },
    {
        title: "Generation - Workflow",
        type: "steps",
        items: [
            "Open the Prompt Builder and select Generation mode.",
            "Fill in each chunk section: Subject, Hair, Eyes, Nose, Mouth, and Background. Use suggestion chips or type freely.",
            "Assign weights to individual keywords that need emphasis. Stubborn features (e.g. thin lips, small eyes) should be weighted at 1.4 or higher.",
            "Fill in the Negative Prompt with anything the model should not generate.",
            "Set your parameters: Resolution, Sampler, Steps, CFG Scale, and optionally a Seed.",
            "Click Generate. Review the output against your intended description.",
            "If the overall composition is correct but specific features need adjustment, move to Inpainting mode.",
        ],
    },
    {
        title: "Generation - Prompting",
        type: "rules",
        items: [
            "Prompts are processed in chunks of 75 tokens. Features in the same chunk compete for attention. Use //BREAK// to separate feature groups so each is processed with focused attention.",
            "Keywords at the start of a chunk carry more weight than those at the end. Always lead with subject, age, and style.",
            "Recommended chunk order: (1) Subject + age + ethnicity + face shape + style, (2) Hair, (3) Eyes + eyebrows, (4) Nose, (5) Mouth + lips + expression, (6) Clothing + lighting + background.",
            "To amplify a keyword: keyword:1.4 or (((keyword))). To suppress: keyword:0.7 or [[[keyword]]]. Weights above 2.0 generally cause image artifacts.",
            "If the model ignores a feature at normal weight, repeat it across multiple chunks and increase the weight. Example: thin lips, repeated as (thin lips:1.7) in the mouth chunk and once more in the subject chunk.",
            "Add solo and headshot to the subject chunk to prevent the model from generating multiple faces or incorrect framing.",
            "Negative prompts suppress unwanted defaults. Always include: multiple faces, duplicate, full body, malformed, bad quality. Add feature-specific suppression as needed (e.g. thick lips, open mouth, beard).",
        ],
    },
    {
        title: "Inpainting - Workflow",
        type: "steps",
        items: [
            "Start from an existing generated image in Inpainting mode.",
            "Select the region you want to modify using the mask tool.",
            "Write a short, focused prompt describing only the masked region. Do not describe the full face.",
            "Set Denoising Strength. Lower values preserve more of the original while higher values allow more change.",
            "Adjust Mask Blur if you want the transition between the inpainted region and the rest of the image to be smooth.",
            "Click Generate. The masked region will update while everything outside remains unchanged.",
            "Repeat for other regions sequentially if needed, saving the output of each pass as the input for the next.",
        ],
    },
    {
        title: "Inpainting - Prompting",
        type: "rules",
        items: [
            "Only describe the masked region. Drop all global context, no age, ethnicity, style, or background. That information is already locked in the base image.",
            "Repeat the target feature 2-3 times in slightly different phrasings. The model has little surrounding context inside a small masked region, so repetition reinforces the instruction.",
            "//BREAK// is optional in inpainting prompts. Since prompts are short, hitting the 75-token limit is unlikely. Only use it if the mask covers two clearly distinct sub-regions (e.g. hair and earrings both masked together).",
            "Example - Mouth region: 'thin lips, very thin lips:1.6, closed mouth // Negative: teeth:1.7, open mouth, thick lips'",
            "Example - Eyes region: 'almond eyes, narrow dark eyes:1.4, dark brown eyes // Negative: large eyes:1.5, round eyes, eyelashes:1.4'",
        ],
    },
    {
        title: "History Usage",
        type: "steps",
        items: [
            "Every time you generate or inpaint a new image, an entry is created in the History panel on the left.",
            "Each entry saves the entire state of that generation: the output image, prompt, negative prompt, seed, and all parameter settings (and time for benchmarks).",
            "Click on any previous version to instantly load its image onto the canvas and restore all of its parameters into the controls.",
        ],
    },
    {
        title: "Prompt Maker",
        type: "rules",
        items: [
            "The Prompt Maker is a modal interface designed to help you construct effective prompts by breaking them down into logical chunks.",
            "It separates the prompt into six distinct sections for txt2img: Subject, Hair, Eyes, Nose, Mouth, and Background.",
            "This chunking aligns with Stable Diffusion's 75-token attention windows. This ensures each facial feature receives focused attention during generation.",
            "For methodology and best practices on prompt chunking and weights, the researcher referenced the comprehensive guide at https://stable-diffusion-art.com/prompt-guide/.",
        ],
    },
    {
        title: "Parameter Reference - Generation",
        type: "params",
        items: [
            {
                name: "Prompt",
                type: "text",
                description: "The main description of what to generate. Uses //BREAK// to separate 75-token chunks. Keywords at the start of each chunk carry the most weight. Supports weighting syntax: keyword:1.4 to amplify, keyword:0.7 to suppress.",
            },
            {
                name: "Negative Prompt",
                type: "text",
                description: "A list of things the model should avoid generating. Processed separately from the main prompt. Effective for suppressing model defaults like multiple faces, open mouth, or unrealistic quality artifacts. Supports weighting syntax the same way the main prompt does.",
            },
            {
                name: "Resolution",
                type: "select",
                description: "The pixel dimensions of the output image.",
            },
            {
                name: "Sampler",
                type: "select",
                description: "The algorithm used to denoise the latent image during generation.",
            },
            {
                name: "Steps",
                type: "number",
                description: "The number of denoising iterations the model runs. More steps allow finer detail resolution but increase generation time.",
                note: "Increasing steps increases generation time roughly linearly.",
            },
            {
                name: "CFG Scale",
                type: "number",
                description: "Classifier-Free Guidance scale. Controls how strictly the model follows your prompt versus generating freely.",
                note: "Recommended: 6.5-7.5 for facial composites.",
            },
            {
                name: "Seed",
                type: "number",
                description: "A number that initializes the random noise the model starts from. Using the same seed with the same prompt and settings produces the same image every time.",
                note: "Record the seed from any output you want to reproduce or compare against.",
            },
        ],
    },
    {
        title: "Parameter Reference - Inpainting",
        type: "params",
        items: [
            {
                name: "Denoising Strength",
                type: "number",
                description: "Controls how much the model can deviate from the base image inside the masked region.",
                note: "Recommended starting value: 0.62.",
            },
            {
                name: "Mask Blur",
                type: "number",
                description: "Controls the softness of the mask boundary",
                note: "Recommended: 4-8 for smooth facial blending.",
            },
        ],
    },
];
