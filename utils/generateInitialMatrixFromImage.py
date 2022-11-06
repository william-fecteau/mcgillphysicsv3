from PIL import Image

IMAGE_FILE = "./assets/surprise.png"


img = Image.open(IMAGE_FILE)
rgb_im = img.convert('RGB')

matrix = []

for i in range(rgb_im.width):
    row = []
    for j in range(rgb_im.height):
        r, g, b = rgb_im.getpixel((j, i))
        if (r == 0 and g == 0 and b == 0):
            row.append(-1)
        else:
            row.append(0)
    matrix.append(row)

print(matrix)
