from app.crud.product import slugify


def test_slugify_normalizes_serbian_latin():
    assert slugify("Čarobna ćebe majica Š Đ Ž") == "carobna-cebe-majica-s-dj-z"
