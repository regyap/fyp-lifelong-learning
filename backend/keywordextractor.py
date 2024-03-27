# from keybert import KeyBERT
# from pdfreader import SimplePDFViewer

# kw_model = KeyBERT(model="all-mpnet-base-v2")
# # insert full_text declaration
# full_text = "A Software Engineer is an IT professional who designs, develops and maintains computer software at a company. They use their creativity and technical skills and apply the principles of software engineering to help solve new and ongoing problems for an organization."


# from pdfreader import PDFDocument, SimplePDFViewer

# fd = open("Regine Yap Resume 2024.pdf", "rb")
# viewer = SimplePDFViewer(fd)
# all_pages = [p for p in viewer.pages()]
# pagenum = len(all_pages)

# texti = ""

# for canvas in viewer:
#     page_strings = canvas.strings
#     text = "".join(page_strings)
#     texti += text

#     print(texti)


# keywords = kw_model.extract_keywords(
#     texti, keyphrase_ngram_range=(1, 3), stop_words="english", highlight=True, top_n=70
# )


# keywords_list = list(dict(keywords).keys())
# print(keywords_list)

from keybert import KeyBERT
from pdfreader import SimplePDFViewer

kw_model = KeyBERT(model="all-mpnet-base-v2")

with open("Regine Yap Resume 2024.pdf", "rb") as fd:
    viewer = SimplePDFViewer(fd)
    texti = ""

    for canvas in viewer:
        page_strings = canvas.strings
        text = "".join(page_strings)
        texti += text

        print(texti)

    keywords = kw_model.extract_keywords(
        texti,
        keyphrase_ngram_range=(1, 3),
        stop_words="english",
        highlight=True,
        top_n=70,
    )

    keywords_list = list(dict(keywords).keys())
    print("---------------------------------------")
    print(keywords_list)
