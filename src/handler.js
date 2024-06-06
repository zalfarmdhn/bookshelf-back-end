const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const finished = () => {
    if (pageCount === readPage) return true;
    return false;
  };
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: finished(),
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  // check untuk buku yang sedang dibaca
  if (request.query.reading === '1') {
    const book = books
      .filter((b) => b.reading === true)
      .map((b) => ({
        id: b.id,
        name: b.name,
        publisher: b.publisher,
      }));
    const response = h.response({
      status: 'success',
      data: {
        books: book,
      },
    });
    response.code(200);
    return response;
  }
  // check untuk buku yang sedang tidak dibaca
  if (request.query.reading === '0') {
    const book = books
      .filter((b) => b.reading === false)
      .map((b) => ({
        id: b.id,
        name: b.name,
        publisher: b.publisher,
      }));
    const response = h.response({
      status: 'success',
      data: {
        books: book,
      },
    });
    response.code(200);
    return response;
  }
  // check buku yang selesai dibaca
  if (request.query.finished === '1') {
    const book = books
      .filter((b) => b.finished === true)
      .map((b) => ({
        id: b.id,
        name: b.name,
        publisher: b.publisher,
      }));
    const response = h.response({
      status: 'success',
      data: {
        books: book,
      },
    });
    response.code(200);
    return response;
  }
  // check buku yang belum selesai dibaca
  if (request.query.finished === '0') {
    const book = books
      .filter((b) => b.finished === false)
      .map((b) => ({
        id: b.id,
        name: b.name,
        publisher: b.publisher,
      }));
    const response = h.response({
      status: 'success',
      data: {
        books: book,
      },
    });
    response.code(200);
    return response;
  }
  // check untuk mendapatkan buku berdasarkan query
  if (request.query.name) {
    const filteredBook = books
      .filter((b) => b.name.toLowerCase().includes(request.query.name.toLowerCase()));
    if (filteredBook.length > 0) {
      const response = h.response({
        status: 'success',
        data: {
          books: filteredBook.map((b) => ({
            id: b.id,
            name: b.name,
            publisher: b.publisher,
          })),
        },
      });
      response.code(200);
      return response;
    }
  }
  // return semua jika tidak ada query
  if (request.query !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        books: books.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  // gagal
  const response = h.response({
    status: 'fail',
    message: 'Gagal mendapatkan koleksi buku',
  });
  response.code(500);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((b) => b.id === bookId)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
