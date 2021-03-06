let BookInstance = require("../models/bookinstance");
let Book = require('../models/book');
let async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate("book")
    .exec(function (err, list_bookinstances) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance == null) { // No results.
        let err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Book:', bookinstance: bookinstance });
    })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {

  Book.find({}, 'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
    });

};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    let bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id).exec((err, results) => {
    if (err) { return next(err); }

    // Successful, so render.
    res.render('bookinstance_delete', { title: 'Delete instance', book_instance: results._id });
  })
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
  BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
    if (err) { return next(err); }
    res.redirect('catalog/bookinstances');
  })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {

  // Get book instances for form.
  BookInstance.findById(req.params.id).populate('book').exec((err, results) => {
    if (err) { return next(err); }
    if (results._id == null) { // No results.
      let err = new Error('Book Instance not found');
      err.status = 404;
      return next(err);
    }
    // Success.

    res.render('bookinstance_form', { title: 'Update Book Instance', book_list: [results.book], bookinstance: results });
  })
};



// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate fields.
  body('book', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must not be empty.').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
  body('status', 'Status must not be empty').isLength({ min: 1 }).trim(),

  // Sanitize fields.
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('due_back').escape(),
  sanitizeBody('status').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book Instance object with escaped/trimmed data and old id.
    let bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        due_back: req.body.due_back,
        status: req.body.status,
        _id: req.params.id
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      // Get book instances for form.
      BookInstance.findById(req.params.id).populate('book').exec((err, results) => {
        if (err) { return next(err); }
        if (results._id == null) { // No results.
          let err = new Error('Book Instance not found');
          err.status = 404;
          return next(err);
        }
        res.render('bookinstance_form', { title: 'Update Book Instance', book_list: [results.book], book_instance: bookinstance, errors: errors.array() });
      })

      return;
    }
    else {
      //Data from form is valid. Update the record.
      BookInstance.findByIdAndUpdate(req.params.id,bookinstance,{}, function (err, updatedbook) {
        if (err) { return next(err); }
        // Successful - redirect to book detail page.
        res.redirect(updatedbook.url);
      });    
    }
  }

];

