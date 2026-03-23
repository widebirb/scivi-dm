export const CHUNKS = [
    {
        id: "subject",
        label: "Subject",
        hint: "Chunk 1: Keywords at the start carry the most weight. Put subject, age, style here first.",
        placeholder: "e.g. young adult woman, oval face, fair skin, photorealistic",
        suggestions: [
            "young adult", "middle-aged", "elderly",
            "woman", "man",
            "photorealistic", "hyperrealistic",
            "Filipino", "East Asian", "South Asian", "Black", "White", "Latino", "Middle Eastern",
            "oval face", "round face", "square face", "heart-shaped face", "oblong face",
            "fair skin", "medium skin", "dark skin", "olive skin",
        ],
    },
    {
        id: "hair",
        label: "Hair",
        hint: "Chunk 2: hair competes with face features if not separated.",
        placeholder: "e.g. long straight black hair, side-swept bangs",
        suggestions: [
            "short hair", "medium hair", "long hair",
            "straight hair", "wavy hair", "curly hair", "coily hair",
            "black hair", "brown hair", "blonde hair", "red hair", "gray hair", "white hair",
            "bangs", "side-swept bangs", "no bangs",
            "ponytail", "loose hair", "bun",
        ],
    },
    {
        id: "eyes",
        label: "Eyes + Eyebrows",
        hint: "Chunk 3: group eyes and brows together so they compete in the same attention window.",
        placeholder: "e.g. almond-shaped brown eyes, thick arched eyebrows",
        suggestions: [
            "almond eyes", "round eyes", "monolid eyes", "hooded eyes",
            "brown eyes", "black eyes", "blue eyes", "green eyes", "hazel eyes",
            "double eyelid", "single eyelid",
            "thick eyebrows", "thin eyebrows", "arched eyebrows", "straight eyebrows", "bushy eyebrows",
        ],
    },
    {
        id: "nose",
        label: "Nose",
        hint: "Chunk 4: isolated chunk, short is fine. Stubborn features should be repeated AND weighted.",
        placeholder: "e.g. small button nose, slightly upturned",
        suggestions: [
            "small nose", "large nose", "medium nose",
            "button nose", "straight nose", "hawk nose", "snub nose", "wide nose",
            "upturned tip", "downturned tip", "bulbous tip",
            "narrow nostrils", "wide nostrils",
        ],
    },
    {
        id: "mouth",
        label: "Mouth + Expression",
        hint: "Chunk 5: include expression here. Neutral expression gives the cleanest composite base.",
        placeholder: "e.g. full lips, neutral expression, closed mouth",
        suggestions: [
            "thin lips", "full lips", "medium lips",
            "neutral expression", "slight smile", "stern expression", "relaxed expression",
            "closed mouth", "slightly parted lips",
            "defined cupid's bow", "downturned corners", "upturned corners",
        ],
    },
    {
        id: "context",
        label: "Clothing + Background",
        hint: "Chunk 6: context and lighting. Keep lighting neutral for forensic/ID composites.",
        placeholder: "e.g. plain white background, soft studio lighting, plain clothing",
        suggestions: [
            "white background", "gray background", "plain background",
            "soft lighting", "studio lighting", "even lighting", "frontal lighting",
            "plain clothing", "collared shirt", "no visible clothing",
            "neutral background", "bokeh background",
        ],
    },
];



// The full weight preset, diabolical code 
export const WEIGHT_OPTIONS = [
    { label: "0.3", value: 0.3 },
    { label: "0.4", value: 0.4 },
    { label: "0.5", value: 0.5 },
    { label: "0.6", value: 0.6 },
    { label: "0.7", value: 0.7 },
    { label: "0.8", value: 0.8 },
    { label: "0.9", value: 0.9 },
    { label: "normal", value: null }, // null = no syntax added
    { label: "1.2", value: 1.2 },
    { label: "1.3", value: 1.3 },
    { label: "1.4", value: 1.4 },
    { label: "1.5", value: 1.5 },
    { label: "1.6", value: 1.6 },
    { label: "1.7", value: 1.7 },
    { label: "1.8", value: 1.8 },
    { label: "1.9", value: 1.9 },
    { label: "2.0", value: 2.0 },
];

export const REGIONS = [
    { id: "hair", label: "Hair" },
    { id: "eyes", label: "Eyes" },
    { id: "eyebrows", label: "Eyebrows" },
    { id: "nose", label: "Nose" },
    { id: "mouth", label: "Mouth" },
    { id: "skin", label: "Skin" },
    { id: "ears", label: "Ears" },
    { id: "jaw", label: "Jaw" },
];

export const REGION_HINTS = {
    hair: "Describe color, length, texture. - 'long straight black hair, loose'",
    eyes: "Shape, color, lashes. - 'almond brown eyes, double eyelid'",
    eyebrows: "Shape, thickness. - 'thick arched eyebrows, dark brown'",
    nose: "Shape and size. - 'small button nose, slightly upturned tip'",
    mouth: "Lip shape, expression. - 'full lips, neutral closed mouth'",
    skin: "Tone, texture. - 'smooth fair skin, clear complexion'",
    ears: "Size, shape. - 'small rounded ears, close to head'",
    jaw: "Structure. - 'soft rounded jawline, narrow chin'",
};

// diabolical line of code, I wrote a few for scafollding then I realized im in the sunken cost fallacy zone didn't even realize i could use ai
export const WEIGHT_PRESETS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];