import base64
from io import BytesIO
from PIL import Image, ImageFilter


def decode_base64_image(data: str) -> Image.Image:
    """
    Strips the data URI prefix if present (data:image/png;base64,...),
    then decodes to a PIL Image.
    """
    if "," in data:
        data = data.split(",")[1]
    raw = base64.b64decode(data)
    return Image.open(BytesIO(raw))


def encode_image_base64(image: Image.Image, fmt: str = "PNG") -> str:
    buffer = BytesIO()
    image.save(buffer, format=fmt)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def resize_image(image: Image.Image, width: int, height: int) -> Image.Image:
    return image.resize((width, height), Image.LANCZOS)


def apply_mask_blur(mask: Image.Image, blur_radius: int) -> Image.Image:
    return mask.filter(ImageFilter.GaussianBlur(radius=blur_radius))


def validate_mask_dimensions(image: Image.Image, mask: Image.Image) -> bool:
    """Mask must match image size exactly."""
    return image.size == mask.size