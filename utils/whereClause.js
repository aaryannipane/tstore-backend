// base - Product.find()

// BigQ - search=coder&page=2&category=shorts

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  // for searching filter
  search() {
    const searchWord = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord });
    return this;
  }

  //   filter
  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    // convert bigQ object to string => copyQ
    let stringCopyQ = JSON.stringify(copyQ);
    // not understand regex than see 108 video
    stringCopyQ = stringCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, (m) => `$${m}`);

    const jsonCopyQ = JSON.parse(stringCopyQ);

    // doubt
    this.base = this.base.find(jsonCopyQ);

    return this;
  }

  // pagination
  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }

    // skip value
    const skipValue = resultPerPage * (currentPage - 1);

    this.base = this.base.limit(resultPerPage).skip(skipValue);
    return this;
  }
}

module.exports = WhereClause;
