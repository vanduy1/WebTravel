/* Dựng giao diện: card danh sách, đổ dữ liệu vào form, định dạng giá. */
var UI = (function () {
  var ICON = {
    departure: '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    transport: '<svg viewBox="0 0 24 24"><path d="M2 14l20-7-4 11-5-3-2 5-1.5-5z"/></svg>',
    hotelClass: '<svg viewBox="0 0 24 24"><path d="M3 19V7m0 12h18V13H3m0-2h7V8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3"/><circle cx="7" cy="10" r="1.8"/></svg>',
    category: '<svg viewBox="0 0 24 24"><path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>'
  }

  function escapeHtml (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /**
   * @param {number|string} value
   * @return {string} ví dụ 9790000 -> "9,790,000"
   */
  function formatPrice (value) {
    var digits = String(value == null ? '' : value).replace(/\D/g, '')
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  function starsHtml (rating) {
    var html = ''
    for (var i = 1; i <= 5; i++) {
      html += '<span class="' + (i <= rating ? 'on' : 'off') + '">★</span>'
    }
    return html + '<span class="score">' + (rating || 0) + '/5</span>'
  }

  function metaHtml (post) {
    var keys = ['departure', 'transport']
    var html = ''
    for (var i = 0; i < keys.length; i++) {
      if (!post[keys[i]]) continue
      html += '<li>' + ICON[keys[i]] + '<span>' + escapeHtml(post[keys[i]]) + '</span></li>'
    }
    return html
  }

  function badgesHtml (post) {
    var html = ''
    if (post.hotelClass) {
      html += '<span class="badge badge-hotel">' + ICON.hotelClass +
        '<span>' + escapeHtml(post.hotelClass) + '</span></span>'
    }
    if (post.category) {
      html += '<span class="badge badge-category">' + ICON.category +
        '<span>' + escapeHtml(post.category) + '</span></span>'
    }
    return html
  }

  function buildCard (post) {
    var card = document.createElement('article')
    card.className = 'card'
    card.setAttribute('data-id', post.id)
    card.innerHTML =
      '<div class="card-media">' +
        '<div class="card-img' + (post.image ? '' : ' is-empty') + '"></div>' +
        badgesHtml(post) +
      '</div>' +
      '<div class="card-body">' +
        '<h3 class="card-title">' + escapeHtml(post.title) + '</h3>' +
        '<div class="stars">' + starsHtml(post.rating) + '</div>' +
        '<ul class="meta">' + metaHtml(post) + '</ul>' +
        '<div class="card-foot">' +
          '<div>' +
            '<span class="price-label">Giá từ</span>' +
            '<span class="price">' + formatPrice(post.price) + '<span class="price-cur">đ</span></span>' +
          '</div>' +
          '<button type="button" class="btn-detail">Xem chi tiết' + ICON.arrow + '</button>' +
        '</div>' +
      '</div>'

    if (post.image) {
      setBackground(card.querySelector('.card-img'), post.image)
    }
    return card
  }

  /** Bọc trong nháy kép vì ảnh SVG mẫu có chứa dấu ngoặc, để trần sẽ vỡ url(). */
  function setBackground (el, dataUrl) {
    el.style.backgroundImage = dataUrl ? 'url("' + dataUrl + '")' : ''
  }

  /**
   * @param {Array} posts danh sách sau khi lọc
   * @param {number} total tổng số bài viết đang có
   * @param {boolean} isFiltered đang lọc theo từ khoá hoặc danh mục
   */
  function renderList (posts, total, isFiltered) {
    var listEl = document.getElementById('list')

    listEl.innerHTML = ''
    for (var i = 0; i < posts.length; i++) {
      listEl.appendChild(buildCard(posts[i]))
    }

    document.getElementById('empty').classList.toggle('hidden', posts.length > 0)
    document.getElementById('empty-title').textContent = isFiltered
      ? 'Không tìm thấy hành trình'
      : 'Chưa có hành trình nào'
    document.getElementById('empty-text').textContent = isFiltered
      ? 'Thử đổi từ khoá hoặc chọn danh mục khác.'
      : 'Thêm bài viết đầu tiên để bắt đầu.'
    document.getElementById('empty-action').classList.toggle('hidden', isFiltered)

    document.getElementById('hero-count').textContent = total
      ? 'Đang có ' + total + ' hành trình'
      : 'Khám phá hành trình của bạn'
    document.getElementById('section-count').textContent = isFiltered
      ? posts.length + ' kết quả'
      : (total ? total + ' bài viết' : '')
    document.getElementById('drawer-foot').textContent = 'ThanhHieuTravel · ' + total + ' bài viết'
  }

  /**
   * @param {Object|null} post null = thêm mới
   */
  function fillForm (post) {
    document.getElementById('form-title').textContent = post ? 'Sửa bài viết' : 'Thêm bài viết'
    document.getElementById('btn-delete').classList.toggle('hidden', !post)

    document.getElementById('f-title').value = post ? post.title : ''
    document.getElementById('f-category').value = post ? (post.category || '') : ''
    document.getElementById('f-departure').value = post ? (post.departure || '') : ''
    document.getElementById('f-transport').value = post ? (post.transport || '') : ''
    document.getElementById('f-hotel').value = post ? (post.hotelClass || '') : ''
    document.getElementById('f-price').value = post ? formatPrice(post.price) : ''

    setRating(post ? post.rating : 4)
    setImage(post ? post.image : '')
    clearErrors()
  }

  /**
   * @return {Object} dữ liệu thô người dùng nhập
   */
  function readForm () {
    return {
      title: document.getElementById('f-title').value.trim(),
      category: document.getElementById('f-category').value,
      rating: getRating(),
      departure: document.getElementById('f-departure').value.trim(),
      transport: document.getElementById('f-transport').value,
      hotelClass: document.getElementById('f-hotel').value,
      price: document.getElementById('f-price').value.replace(/\D/g, ''),
      image: getImage()
    }
  }

  function setRating (rating) {
    var stars = document.querySelectorAll('#f-rating .star')
    for (var i = 0; i < stars.length; i++) {
      stars[i].classList.toggle('on', Number(stars[i].getAttribute('data-value')) <= rating)
    }
  }

  function getRating () {
    return document.querySelectorAll('#f-rating .star.on').length
  }

  function setImage (dataUrl) {
    var preview = document.getElementById('img-preview')
    setBackground(preview, dataUrl)
    preview.classList.toggle('has-image', !!dataUrl)
    preview.setAttribute('data-image', dataUrl || '')
    document.getElementById('btn-clear-image').classList.toggle('hidden', !dataUrl)
  }

  function getImage () {
    return document.getElementById('img-preview').getAttribute('data-image') || ''
  }

  /**
   * @param {Object} errors ví dụ {title: 'Hãy nhập tiêu đề.'}
   */
  function showErrors (errors) {
    clearErrors()
    for (var key in errors) {
      if (!Object.prototype.hasOwnProperty.call(errors, key)) continue
      var msgEl = document.getElementById('err-' + key)
      if (msgEl) msgEl.textContent = errors[key]
      var inputEl = document.getElementById('f-' + key) || document.getElementById(key)
      if (inputEl) inputEl.classList.add('invalid')
    }
  }

  function clearErrors () {
    var msgEls = document.querySelectorAll('.err')
    for (var i = 0; i < msgEls.length; i++) msgEls[i].textContent = ''
    var inputEls = document.querySelectorAll('.input.invalid')
    for (var j = 0; j < inputEls.length; j++) inputEls[j].classList.remove('invalid')
  }

  /* ===== Màn chi tiết hành trình ===== */

  /**
   * @param {Object} post
   * @param {boolean} canEdit đang đăng nhập quản trị hay không
   */
  function renderDetail (post, canEdit) {
    var body = document.getElementById('detail-body')
    var metaKeys = ['departure', 'transport', 'hotelClass']
    var metaItems = ''

    for (var i = 0; i < metaKeys.length; i++) {
      if (!post[metaKeys[i]]) continue
      metaItems += '<li>' + ICON[metaKeys[i]] + '<span>' + escapeHtml(post[metaKeys[i]]) + '</span></li>'
    }

    body.innerHTML =
      '<article class="panel panel-flush">' +
        '<div class="detail-media">' +
          '<div class="detail-img' + (post.image ? '' : ' is-empty') + '"></div>' +
          badgesHtml(post) +
        '</div>' +
        '<div class="detail-content">' +
          '<h2 class="detail-title">' + escapeHtml(post.title) + '</h2>' +
          '<div class="stars">' + starsHtml(post.rating) + '</div>' +
          '<ul class="meta">' + metaItems + '</ul>' +
          '<div class="detail-price">' +
            '<span class="price-label">Giá từ</span>' +
            '<span class="price">' + formatPrice(post.price) + '<span class="price-cur">đ</span></span>' +
          '</div>' +
        '</div>' +
      '</article>' +
      '<a class="btn btn-primary btn-block" href="#/contact">Liên hệ đặt tour</a>' +
      (canEdit
        ? '<a class="btn btn-ghost btn-block detail-edit" href="#/edit/' + escapeHtml(post.id) + '">Sửa bài viết</a>'
        : '')

    if (post.image) {
      setBackground(body.querySelector('.detail-img'), post.image)
    }
  }

  /* ===== Trang giới thiệu / liên hệ ===== */

  var FEATURE_ICONS = [
    '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1z"/></svg>'
  ]

  function renderAbout (data) {
    var items = ''
    for (var i = 0; i < data.features.length; i++) {
      var feature = data.features[i]
      if (!feature.title) continue
      items +=
        '<li>' +
          '<span class="feature-icon">' + FEATURE_ICONS[i % FEATURE_ICONS.length] + '</span>' +
          '<div>' +
            '<p class="feature-title">' + escapeHtml(feature.title) + '</p>' +
            '<p class="feature-text">' + escapeHtml(feature.text) + '</p>' +
          '</div>' +
        '</li>'
    }

    document.getElementById('about-body').innerHTML =
      '<section class="panel">' +
        '<h2 class="page-title">' + escapeHtml(data.title) + '</h2>' +
        '<p class="page-text">' + escapeHtml(data.intro) + '</p>' +
      '</section>' +
      (items
        ? '<section class="panel">' +
            '<h2 class="panel-title">Vì sao chọn chúng tôi</h2>' +
            '<ul class="feature-list">' + items + '</ul>' +
          '</section>'
        : '')
  }

  function renderContact (data) {
    var rows = [
      { icon: 2, label: 'Điện thoại', value: data.phone, href: 'tel:' + String(data.phone).replace(/[^\d+]/g, '') },
      { icon: 'mail', label: 'Email', value: data.email, href: 'mailto:' + data.email },
      { icon: 'pin', label: 'Văn phòng', value: data.address },
      { icon: 'clock', label: 'Giờ làm việc', value: data.hours }
    ]

    var EXTRA = {
      mail: '<svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/></svg>',
      pin: ICON.departure,
      clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
    }

    var items = ''
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i]
      if (!row.value) continue
      var icon = typeof row.icon === 'number' ? FEATURE_ICONS[row.icon] : EXTRA[row.icon]
      var value = row.href
        ? '<a class="contact-link" href="' + escapeHtml(row.href) + '">' + escapeHtml(row.value) + '</a>'
        : '<p class="feature-text">' + escapeHtml(row.value) + '</p>'

      items +=
        '<li>' +
          '<span class="feature-icon">' + icon + '</span>' +
          '<div><p class="feature-title">' + row.label + '</p>' + value + '</div>' +
        '</li>'
    }

    document.getElementById('contact-body').innerHTML =
      '<section class="panel">' +
        '<h2 class="page-title">' + escapeHtml(data.title) + '</h2>' +
        (data.intro ? '<p class="page-text">' + escapeHtml(data.intro) + '</p>' : '') +
        '<ul class="contact-list">' + items + '</ul>' +
      '</section>'
  }

  /* ===== Form sửa nội dung trang ===== */

  function fillPageForm (name, data) {
    if (name === 'about') {
      document.getElementById('pa-title').value = data.title
      document.getElementById('pa-intro').value = data.intro
      for (var i = 0; i < 3; i++) {
        var feature = data.features[i] || { title: '', text: '' }
        document.getElementById('pa-f' + i + '-title').value = feature.title
        document.getElementById('pa-f' + i + '-text').value = feature.text
      }
    } else {
      document.getElementById('pc-title').value = data.title
      document.getElementById('pc-intro').value = data.intro
      document.getElementById('pc-phone').value = data.phone
      document.getElementById('pc-email').value = data.email
      document.getElementById('pc-address').value = data.address
      document.getElementById('pc-hours').value = data.hours
    }
    clearErrors()
  }

  function readPageForm (name) {
    if (name === 'about') {
      var features = []
      for (var i = 0; i < 3; i++) {
        features.push({
          title: document.getElementById('pa-f' + i + '-title').value.trim(),
          text: document.getElementById('pa-f' + i + '-text').value.trim()
        })
      }
      return {
        title: document.getElementById('pa-title').value.trim(),
        intro: document.getElementById('pa-intro').value.trim(),
        features: features
      }
    }

    return {
      title: document.getElementById('pc-title').value.trim(),
      intro: document.getElementById('pc-intro').value.trim(),
      phone: document.getElementById('pc-phone').value.trim(),
      email: document.getElementById('pc-email').value.trim(),
      address: document.getElementById('pc-address').value.trim(),
      hours: document.getElementById('pc-hours').value.trim()
    }
  }

  /* ===== Hiện/ẩn theo quyền ===== */

  /**
   * data-auth="in"  : chỉ hiện khi đã đăng nhập
   * data-auth="out" : chỉ hiện khi chưa đăng nhập
   * @param {boolean} isAdmin
   * @param {string} username
   */
  function applyRole (isAdmin, username) {
    var els = document.querySelectorAll('[data-auth]')
    for (var i = 0; i < els.length; i++) {
      var want = els[i].getAttribute('data-auth')
      els[i].classList.toggle('hidden', want === 'in' ? !isAdmin : isAdmin)
    }
    document.getElementById('drawer-user-name').textContent = username
  }

  return {
    renderList: renderList,
    renderDetail: renderDetail,
    renderAbout: renderAbout,
    renderContact: renderContact,
    fillForm: fillForm,
    readForm: readForm,
    fillPageForm: fillPageForm,
    readPageForm: readPageForm,
    applyRole: applyRole,
    setRating: setRating,
    setImage: setImage,
    formatPrice: formatPrice,
    showErrors: showErrors,
    clearErrors: clearErrors
  }
})()
