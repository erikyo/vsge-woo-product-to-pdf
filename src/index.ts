import pdfMake from "pdfmake/src/browser-extensions/pdfMake";

Date.prototype.yyyymmdd = function () {
  const mm = this.getMonth() + 1; // getMonth() is zero-based
  const dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

// THE PDF SETTINGS PASSED FROM WP ENQUEUE
const assetsPath = "assets";
const mainColorHex = "#f00";

const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

const fonts = {
  Klavika: {
    normal: assetsPath + "/assets/fonts/klavika-light-webfont.ttf",
    italics: assetsPath + "/assets/fonts/klavika-light-italic-webfont.ttf",
    bold: assetsPath + "/assets/fonts/klavika-medium-webfont.ttf",
    bolditalics: assetsPath + "/assets/fonts/klavika-bold-webfont.ttf",
  },
};

const titleRegex = new RegExp("/?H[1-6]");
const ifElement = (value, selectEl = ["P", "LI", "B"]) =>
  selectEl.indexOf(value) > -1 || titleRegex.test(value);
const removeNulls = (tree) =>
  Object.values(tree).filter((value) => Object.keys(value).length !== 0);

class makeProductPDF {
  constructor() {
    //assuming productData is a variable set earlier
    this.productPDF = dd;
    this.productData = productData;
    this.fonts = fonts;

    const date = new Date();
    this.date = date;

    // let productData = JSON.parse(document.getElementById('productData').innerText);
    // console.log(productData);

    const productData = {};

    productData.url = document.location.toString();
    productData.name = document.querySelector(".product_title").innerHTML;
    productData.slug = this.toSlug(productData.name);
    productData.brandColor = mainColorHex || "#222222";
    productData.brandName =
      document.querySelector(".custom-logo").getAttribute("alt") ?? "";

    productData.description = document.querySelector(
      ".woocommerce-Tabs-panel--description"
    );
    productData.media = document.querySelector(
      ".woocommerce-Tabs-panel--media"
    );
    productData.relateds = document.querySelector(
      ".woocommerce-Tabs-panel--relateds"
    );
    productData.comparison = document.querySelector(
      ".woocommerce-Tabs-panel--comparison"
    );
    productData.address = document
      .querySelector("#regional-footer")
      .innerHTML.replace("<br>", " - ");

    productData.props = [
      [
        "MPN: ",
        document.querySelector("#product-meta--mpn span")
          ? document.querySelector("#product-meta--mpn span").innerHTML
          : "",
      ],
      [
        "GTIN: ",
        document.querySelector("#product-meta--gtin span")
          ? document.querySelector("#product-meta--gtin span").innerHTML
          : "",
      ],
      [
        "Category: ",
        document.querySelector(".product-meta .posted_in")
          ? this.collectTermsData(
              document.querySelector(".product-meta .posted_in span")
            )
          : null,
      ],
      [
        "Tags: ",
        document.querySelector(".product-meta .tagged_as")
          ? this.collectTermsData(
              document.querySelector(".product-meta .tagged_as span")
            )
          : null,
      ],
      [
        "Approvals: ",
        document.querySelector("#product-meta--approvals")
          ? this.collectTermsData(
              document.querySelector("#product-meta--approvals span")
            )
          : null,
      ],
    ];

    const beautifyArgs = {
      indent_size: 0,
      indent_char: "",
      eol: "",
      end_with_newline: false,
      preserve_newlines: false,
      max_preserve_newlines: 0,
      wrap_line_length: 0,
      wrap_attributes: "auto",
    };

    const mediaImages = [];
    mediaImages.mainImage = document
      .querySelector(".woocommerce-product-gallery__image a")
      .getAttribute("href"); //woocommerce-product-gallery__image
    const logoImg = document.querySelector(".custom-logo");
    mediaImages.brandImage =
      logoImg.getAttribute("data-src") || logoImg.getAttribute("src") || "";

    console.log(mediaImages.brandImage);

    const html = [];
    html.description = productData.description
      ? html_beautify(productData.description.innerHTML, beautifyArgs)
      : null;
    html.relateds = productData.relateds
      ? html_beautify(productData.relateds.innerHTML, beautifyArgs)
      : null;
    html.media = productData.media
      ? html_beautify(productData.media.innerHTML, beautifyArgs)
      : null;
    html.comparison = productData.comparison
      ? html_beautify(productData.comparison.innerHTML, beautifyArgs)
      : null;

    pdfMake.fonts = fonts;

    // convert millimeters to points (the ratio is 2.835)
    const mmToPoints = (val) => val * 2.835;

    const pageSize = {
      width: mmToPoints(210.0),
      height: mmToPoints(297.0),
    };
    const pageMargins = [20, 40, 20, 30];

    // the pdf content array
    const pdfContent = [];

    // the header of the product pdf
    pdfContent.push({
      style: "header",
      layout: "noBorders",
      table: {
        widths: ["50%", "50%"],
        body: [
          [
            {
              style: "productImageWrapper",
              fillColor: "#f3f3f3",
              stack: [
                {
                  image: "mainImage",
                  fit: [(pageSize.width - 50) / 2, (pageSize.width / 2) * 0.66], // 3:2 ratio
                  style: "productImage",
                },
              ],
            },
            {
              stack: [
                {
                  text: productData.name,
                  style: "productTitle",
                },
                {
                  text: productData.description,
                  style: "productSubTitle",
                },
                {
                  style: "props",
                  stack: [productProps(productData.props)],
                },
              ],
              margin: [10, 0, 0, 0],
            },
          ],
        ],
        // optional space between columns
        columnGap: 0,
      },
    });

    // the product description that will appear just below the header
    if (html.description) {
      html.description = this.mapDOM(html.description, false);
      pdfContent.push(this.mapDOMtoPDF(html.description));
    }

    // a link to the real product page on the website (with qr code)
    pdfContent.push({
      stack: [
        {
          qr: productData.url,
          fit: "55",
          foreground: "#333333",
          version: 5,
          margin: [0, 0, 0, 10],
        },
        {
          text: productData.url,
          style: "A",
        },
      ],
      margin: [0, 40, 0, 0],
      alignment: "center",
    });

    if (html.media) {
      html.media = mapDOM(html.media, false);
      html["pdf-media"] = mapMediaToPDF(
        html.media.content[1].content,
        html.media.content[0].content[0]
      );

      if (html["pdf-media"].length) pdfContent.push(buildSectionTitle("Media"));

      pdfContent.push(mapToColumns(html["pdf-media"], 14));
    }

    if (html.relateds) {
      html.relateds = mapDOM(html.relateds, false);
      const sectionTitle = document.querySelector(
        "#tab-title-relateds a"
      ).innerHTML; //
      html["pdf-relateds"] = mapRelatedsToPDF(
        html.relateds.content,
        sectionTitle
      );

      // the related section title
      if (sectionTitle) pdfContent.push(buildSectionTitle(sectionTitle));

      Object.entries(html["pdf-relateds"]).forEach(function (section) {
        if (sectionTitle) pdfContent.push(mapToColumns(section[1], 14));
      });
    }

    if (html.comparison) {
      html.comparison = mapDOM(html.comparison, false);
      const sectionTitle = html.comparison.content[0].content[0];
      pdfContent.push(buildSectionTitle(sectionTitle));
      pdfContent.push(
        mapComparisonToTable(html.comparison.content, sectionTitle)
      );
    }

    // THE PDF DATA
    const dd = {
      // a string or { width: number, height: number }
      pageSize,

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: "portrait",

      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins,

      info: {
        title: productData.slug,
        author: productData.brandName,
        subject: productData.name,
        keywords: productData.brandName + " " + productData.name,
      },

      header(currentPage, pageCount, pageSize) {
        return [
          {
            layout: "noBorders",
            fillColor: productData.brandColor,
            table: {
              heights: 25,
              widths: ["100%"],
              body: [
                [
                  {
                    image: "mainImage",
                    fit: [45, 15],
                    margin: [20, 5, 0, 0],
                    alignment: "left",
                  },
                ],
              ],
              columnGap: 0,
            },
          },
        ];
      },

      footer(currentPage, pageCount) {
        return [
          {
            fontSize: 6,
            alignment: "center",
            margins: [20, 5, 20, 0],
            text: [
              {
                text: currentPage.toString() + " of " + pageCount + "\n",
              },
              {
                text:
                  productData.brandName.toUpperCase() +
                  " ©" +
                  date.getFullYear() +
                  " - ",
                bold: true,
              },
              productData.address,
            ],
          },
        ];
      },

      content: [pdfContent],
      images: mediaImages,
      styles: {
        // Wrappers
        header: {
          margin: [0, 0, 0, 10],
        },

        // Product Title section
        productTitle: {
          fontSize: 16,
          bold: true,
          margin: [0, 15, 0, 0],
        },
        productSubTitle: {
          fontSize: 9,
          bold: false,
          margin: [0, 0, 0, 15],
        },

        // Product Attributes key - val
        props: {
          bold: true,
          fontSize: 9,
          lineHeight: 1.3,
        },
        propVal: {
          bold: false,
        },

        // Product image
        productImageWrapper: {
          height: pageSize.width / 2,
          margin: 15,
        },

        productImage: {
          alignment: "center",
        },

        H2: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5],
        },

        H3: {
          fontSize: 12,
          bold: true,
          margin: [0, 15, 0, 5],
        },

        UL: {
          margin: [10, 2, 0, 2],
        },

        A: {
          color: "#0064bd",
          decoration: "underline",
        },

        // Product Title section
        relatedTitle: {
          fontSize: 8,
          bold: true,
          lineHeight: 1.1,
        },
        relatedSubTitle: {
          fontSize: 7,
        },
      },

      defaultStyle: {
        fontSize: 9,
        lineHeight: 1.2,
        columnGap: 20,
        font: "Klavika",
      },

      pageBreakBefore(
        currentNode,
        followingNodesOnPage,
        nodesOnNextPage,
        previousNodesOnPage
      ) {
        return (
          currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0
        );
      },
    };
  }

  // collect terms of a given taxonomy
  collectTermsData(taxData) {
    const termsData = taxData.children;
    const taxonomy = [];
    for (let i = 0; i < termsData.length; i++) {
      taxonomy.push(termsData[i].innerHTML);
    }
    return taxonomy;
  }

  // collect term data
  productProps(props) {
    const formattedProps = [];
    props.forEach((e) => {
      if (!e[1]) return;
      formattedProps.push({
        text: [
          e[0],
          {
            text: Array.isArray(e[1]) ? e[1].join(", ") : e[1],
            style: "propVal",
          },
        ],
      });
    });
    return formattedProps;
  }

  toSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "_");
  }

  parseTagAttr(tag) {
    if (tag.attributes && tag.attributes.length) {
      const attributes = {};
      for (let i = 0; i < tag.attributes.length; i++) {
        attributes[tag.attributes[i].nodeName] = tag.attributes[i].nodeValue;
      }
      return attributes;
    }
    return false;
  }

  //Recursively loop through DOM elements and assign properties to object
  treeHTML(element, object) {
    object.type = element.nodeName;

    const nodeList = element.childNodes;

    if (nodeList !== null && nodeList.length) {
      object.content = [];

      for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].nodeType === 3) {
          // nodeType 3	Text | Represents textual content in an element or attribute
          if (object.type === "STRONG" || object.type === "B") {
            delete object.type;
            delete object.content;
            object.bold = true;
            object.text = nodeList[i].nodeValue;
          } else if (object.type === "EM" || object.type === "I") {
            delete object.type;
            delete object.content;
            object.italics = true;
            object.text = nodeList[i].nodeValue;
          } else if (nodeList[i].nodeValue !== " ") {
            if (
              object.content[object.content.length - 1] &&
              typeof object.content[object.content.length - 1] === "string" &&
              typeof nodeList[i].nodeValue === "string"
            ) {
              object.content[object.content.length - 1] =
                object.content[object.content.length - 1] +
                nodeList[i].nodeValue;
            } else {
              object.content.push({});
              object.content[object.content.length - 1] = nodeList[i].nodeValue;
            }
          }
        } else {
          if (nodeList[i].nodeName === "BR") {
            object.content[object.content.length - 1] =
              object.content[object.content.length - 1] + "\n";
          }

          if (
            nodeList[i].nodeName !== "NOSCRIPT" &&
            nodeList[i].nodeName !== "#comment" &&
            nodeList[i].nodeName !== "BR"
          ) {
            object.content.push({});
          } else {
            continue;
          }

          // collect attributes
          let attributes;
          if ((attributes = this.parseTagAttr(nodeList[i])) !== false)
            object.content[object.content.length - 1].attrs = attributes;

          if (nodeList[i].nodeType === 3 && nodeList[i].length <= 1) {
            // is simple text that we can store as content
            object.content[object.content.length - 1].text =
              nodeList[i].nodeValue;
            object.content[object.content.length - 1].class =
              nodeList[i].classList;
          } else {
            // isn't a text node so recursively we need to look inside the tag
            treeHTML(nodeList[i], object.content[object.content.length - 1]);
          }
        }
      }
    }
  }

  mapDOM(element, json) {
    const treeObject = {};

    // If string convert to document Node
    if (typeof element === "string") {
      let docNode;

      if (window.DOMParser) {
        const parser = new DOMParser();
        docNode = parser.parseFromString(element, "text/html"); // or "text/xml"
      } else {
        docNode = new ActiveXObject("Microsoft.XMLDOM");
        docNode.async = false;
        docNode.loadXML(element);
      }

      element = docNode.body;
    }

    this.treeHTML(element, treeObject);

    return json ? JSON.stringify(treeObject) : treeObject;
  }

  mapDOMtoPDF(element) {
    const treeObject = {};

    //Recursively loop through DOM elements and assign properties to object
    const treePDF = (element, object) => {
      // init the element
      if (element.type) element.type = element.type.toLowerCase();
      const nodeType = ifElement(element.type, ["p", "li"])
        ? "text"
        : element.type;
      object[nodeType] = [];

      if (element.content && element.content.length) {
        // for each element contained (p, li etc)
        for (let i = 0; i < element.content.length; i++) {
          // if the element is consistent (to avoid "<p> </p>")
          if (
            (element.content[i].content !== undefined ||
              element.content[i].text !== undefined) &&
            (element.content[i].content || element.content[i].text)
          ) {
            const nodeList = element.content;

            if (typeof nodeList[0] === "string" && nodeList.length === 1) {
              // it's a text node
              object[nodeType] = nodeList;
            } else if (nodeList[0].text && nodeList.length === 1) {
              // this is it's a text node but with sub-elements
              object[nodeType].push({});
              object[nodeType][object[nodeType].length - 1].text =
                nodeList[i].text;
            } else if (
              nodeList[i].content &&
              nodeList[i].content.length === 1 &&
              !nodeList[i].content[0].content
            ) {
              // the element the end of the branch - allowedElements() to check specific tag types
              object[nodeType].push({
                text: nodeList[i].content[0],
                style: nodeList[i].type,
              });

              if (nodeList[i].attrs) {
                // Add the attributes
                Object.entries(nodeList[i].attrs).forEach(function (attr) {
                  object[nodeType][i][attr[0]] = attr[1];
                });
              }

              object[nodeType][object[nodeType].length - 1].style =
                nodeList[i].type;
            } else {
              // create a new array and push all the elements inside
              object[nodeType].push({});

              if (nodeList[i].type === "LI") {
                // its a list node
                object[nodeType][object[nodeType].length - 1].style =
                  nodeList[i].type;
                object[nodeType][object[nodeType].length - 1].type =
                  nodeList[i].type;

                // search for lists inside this list
                const listChild = nodeList[i].content.filter(
                  (e) => e.type === "UL" || e.type === "OL"
                );
                if (listChild && listChild.length) {
                  listChild.forEach(function (child) {
                    treePDF(
                      child,
                      object[nodeType][object[nodeType].length - 1]
                    );
                  });
                } else {
                  //if this has not list inside get the text
                  object[nodeType][object[nodeType].length - 1].text =
                    nodeList[i].content;
                }
              } else if (nodeList[i].type) {
                // this node has subnodes
                object[nodeType][object[nodeType].length - 1].style =
                  nodeList[i].type;
                treePDF(
                  nodeList[i],
                  object[nodeType][object[nodeType].length - 1]
                );
              } else {
                // is is a standard paragraph
                nodeList[i].type = "P";
                object[nodeType] = nodeList;
                break;
              }
            }
          }
        }
      }
    };

    treePDF(element, treeObject);

    return treeObject.body;
  }

  mapMediaToPDF(elements, sectionTitle = "Media") {
    const mediaTree = [];

    const sectionTitleSlug = toSlug(sectionTitle);

    elements.forEach(function (el, i) {
      const media = {
        title: el.content[0].content[0].content.filter((e) => e.type === "H3"),
        subtitle: el.content[0].content[0].content.filter(
          (e) => e.type === "H6"
        ),
        data: el.content[0].content[0].content.filter((e) => e.type === "IMG"),
        href: el.content[0].content.filter((e) => e.type === "A"),
      };

      mediaTree.push({
        layout: "noBorders",
        margin: [0, 0, 0, 5],
        table: {
          widths: [45, "*", 50],
          height: 40,
          alignment: "center",
          body: [
            [
              {
                stack: [
                  {
                    fit: [40, 40],
                    image: "mediaImage_" + sectionTitleSlug + "_" + i,
                  },
                ],
                margin: [5, 0, 5, 0],
                fillColor: "#f3f3f3",
              },
              {
                stack: [
                  {
                    text: media.title[0].content[0],
                    style: "relatedTitle",
                  },
                  {
                    text: media.subtitle[0].content[0],
                    style: "relatedSubTitle",
                  },
                ],
                alignment: "left",
                margin: [5, 5, 0, 0],
              },
              {
                qr: media.href[0].attrs.href,
                fit: "50",
                foreground: "#333",
                version: 6,
                alignment: "right",
              },
            ],
          ],
        },
      });

      // adds the image src to media image collection
      mediaImages["mediaImage_" + sectionTitleSlug + "_" + i] =
        media.data[0].attrs["data-src"];
    });
    return mediaTree;
  }

  buildSectionTitle(sectionTitle) {
    return { text: sectionTitle, style: "H2", pageBreak: "before" };
  }

  mapRelatedsToPDF(elements, sectionTitle = "Relateds") {
    const relatedsTree = [];

    const sectionTitleSlug = toSlug(sectionTitle);

    elements.shift(); // remove the first item because it's the section main title

    elements.forEach(function (subEl, i) {
      const sectionSubTitleSlug = subEl.content[0].content[0]
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "_");
      relatedsTree[sectionSubTitleSlug] = [];
      relatedsTree[sectionSubTitleSlug].push({
        text: subEl.content[0].content[0],
        style: "H3",
      });

      // the ul that contains products
      subEl.content[1].content.forEach(function (el, i) {
        const related = {
          title: el.content[0].content[2].content[0],
          subtitle: el.content[0].content[3].content[0].content
            ? el.content[0].content[3].content[0].content[0]
            : "",
          data: el.content[0].content[1]
            ? el.content[0].content[1].content.filter((e) => e.type === "IMG")
            : "",
          href: el.content[0].attrs.href,
        };

        relatedsTree[sectionSubTitleSlug].push({
          layout: "noBorders",
          margin: [0, 0, 0, 5],
          table: {
            widths: [45, "*", 45],
            height: 40,
            alignment: "center",
            body: [
              [
                {
                  stack: [
                    {
                      fit: [40, 40],
                      image: "mediaImage_" + sectionSubTitleSlug + "_" + i,
                    },
                  ],
                  margin: [5, 0, 5, 0],
                  fillColor: "#f3f3f3",
                },
                {
                  stack: [
                    {
                      text: related.title,
                      style: "relatedTitle",
                    },
                    {
                      text: related.subtitle,
                      style: "relatedSubTitle",
                    },
                  ],
                  alignment: "left",
                  margin: [5, 5, 0, 0],
                },
                {
                  qr: related.href,
                  fit: "50",
                  foreground: "#333",
                  version: 6,
                  alignment: "right",
                },
              ],
            ],
          },
        });

        mediaImages["mediaImage_" + sectionSubTitleSlug + "_" + i] =
          related.data[0].attrs["data-src"];
      });
    });

    return relatedsTree;
  }

  colModel = function (column1, column2, breakPage) {
    return [
      {
        columns: [
          {
            stack: column1,
          },
          {
            stack: column2 || "",
          },
        ],
        pageBreak: breakPage ? "after" : null,
      },
    ];
  };

  mapToColumns(elements, itemPerColumn) {
    const columns = [];
    const formattedColumns = [];

    if (elements[0].text) {
      formattedColumns.push(elements.splice(0, 1));
    }

    if (!elements.length) {
      // no elements
      return "";
    } else if (elements.length < itemPerColumn) {
      // if there are less elements than the number of items allowed per column we can split the content in two half columns
      columns.push(
        elements.splice(0, Math.ceil(elements.length / 2)),
        elements.splice(0, elements.length)
      ); // the number of items per column
    } else {
      // add the items to columns while the columns are full filled
      while (elements.length > itemPerColumn)
        columns.push(elements.splice(0, itemPerColumn));

      // adds the remaining items
      if (columns.length % 2 === 0) {
        // to a multiple columns
        columns.push(
          elements.splice(0, Math.ceil(elements.length / 2)),
          elements.splice(0, elements.length)
        );
      } else {
        // to a single column
        columns.push(elements.splice(0, elements.length));
      }
    }

    while (columns.length > 0) {
      formattedColumns.push(
        colModel(columns.splice(0, 1), columns.splice(0, 1), columns.length > 0)
      );
    }

    return formattedColumns;
  }

  mapComparisonToTable(elements, sectionTitle = "Comparison") {
    const sectionTitleSlug = toSlug(sectionTitle);

    const comparisonTreeHeader = [];
    let comparisonTree = [];
    const rows = [];
    rows[0] = [];
    const rowsTableWidth = [120];

    // the table header
    if (typeof elements[0].content[0] === "string") {
      comparisonTreeHeader.push(elements[1].content[0].content.splice(0, 1));
    }

    comparisonTreeHeader[0][0].content.forEach(function (e, i) {
      if (typeof e.content[i] === "string") {
        rows[0].push({});
        //rows[0].push({
        //   text: e.content[0],
        //  bold: true
        // });
      } else {
        const cellContent = e.content[0].content.filter(
          (e) => e.type === "SPAN"
        );
        rows[0].push({
          alignment: "center",
          stack: [
            {
              fit: [40, 40],
              margin: 3,
              image: "mediaImage_" + sectionTitleSlug + "_" + i,
            },
            {
              text: cellContent[0].content[0],
              bold: true,
              alignment: i === 0 ? "left" : "center",
            },
          ],
        });

        mediaImages["mediaImage_" + sectionTitleSlug + "_" + i] =
          e.content[0].content[0].attrs["data-src"];
      }
      rowsTableWidth.push(
        460 / comparisonTreeHeader[0][0].content.length < 200
          ? 460 / comparisonTreeHeader[0][0].content.length
          : 150
      );
    });

    for (let r = 1; r < elements[1].content[0].content.length; r++) {
      rows[r] = [];
      for (
        let c = 0;
        c < elements[1].content[0].content[0].content.length;
        c++
      ) {
        rows[r].push({
          text: elements[1].content[0].content[r].content[c].content[0],
          bold: elements[1].content[0].content[r].content[c].attrs || false,
          alignment: c === 0 ? "left" : "right",
        });
      }
    }

    comparisonTree = {
      table: {
        widths: rowsTableWidth,
        body: rows,
      },
    };

    return comparisonTree;
  }

  async generate() {
    const pdfMake = await import("pdfmake");
    const downloadIco = document.getElementById("social-download").innerHTML;
    const loader = document.createElement("span");
    loader.className = "ajax-loader";

    document.getElementById("social-download").innerHTML = "";
    document.getElementById("social-download").appendChild(loader);

    const pdfDocGenerator = pdfMake.createPdf(
      this.productPDF,
      null,
      this.fonts
    );
    pdfDocGenerator.filename =
      this.productData.slug + "-" + this.date.yyyymmdd() + ".pdf";

    pdfDocGenerator.getBlob((blob) => {
      const link = document.createElement("a");

      const blobURL = URL.createObjectURL(blob);
      link.download = pdfDocGenerator.filename;
      link.target = "_blank";
      link.href = blobURL;
      document.getElementById("social-download").append(link);
      link.click();
      document.getElementById("social-download").innerHTML = downloadIco;
      downloadButton.removeClass("loading");
    });
  }
}

async function genPDF() {
  const product2pdf = new makeProductPDF();
  await product2pdf.generate();
}

// on click trigger the PDf from HTML fn
const downloadButton = document.querySelector("#social-download");
downloadButton.addEventListener("click", async (e) => {
  // Checking to see if the download button has the class of loading. If it does, it will stop the propagation of the event and return a console log of "please wait!"
  if (downloadButton.classList.contains("loading")) {
    e.stopPropagation();
    return console.log("please wait!");
  }
  downloadButton.classList.add("loading");

  await genPDF();
});
