/*
 * Cloud store backed by Supabase Postgres + Storage.
 * Public reads are protected by table RLS; writes require a user_id in admin_users.
 */
var Store = (function () {
  var posts = []
  var pages = {}

  function mapPost (row) {
    return {
      id: row.id,
      image: row.image_url || '',
      title: row.title || '',
      category: row.category || '',
      rating: Number(row.rating || 0),
      departure: row.departure || '',
      transport: row.transport || '',
      hotelClass: row.hotel_class || '',
      price: Number(row.price || 0),
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : 0
    }
  }

  async function init () {
    var postResult = await thSupabase.from('travel_posts').select('*').order('updated_at', { ascending: false })
    if (postResult.error) throw postResult.error
    posts = (postResult.data || []).map(mapPost)

    var pageResult = await thSupabase.from('site_pages').select('slug, content')
    if (pageResult.error) throw pageResult.error
    pages = {}
    ;(pageResult.data || []).forEach(function (row) { pages[row.slug] = row.content })
  }

  function all () {
    return posts.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0) })
  }

  function get (id) {
    for (var i = 0; i < posts.length; i++) {
      if (String(posts[i].id) === String(id)) return posts[i]
    }
    return null
  }

  async function upsert (post) {
    var payload = {
      title: post.title,
      image_url: post.image || '',
      category: post.category || '',
      rating: Number(post.rating || 0),
      departure: post.departure || '',
      transport: post.transport || '',
      hotel_class: post.hotelClass || '',
      price: Number(post.price || 0),
      updated_at: new Date().toISOString()
    }
    if (post.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(post.id)) {
      payload.id = post.id
    }

    var result = await thSupabase.from('travel_posts').upsert(payload).select('*').single()
    if (result.error) throw result.error

    var saved = mapPost(result.data)
    var found = false
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === saved.id) { posts[i] = saved; found = true; break }
    }
    if (!found) posts.push(saved)
    return saved
  }

  async function remove (id) {
    var result = await thSupabase.from('travel_posts').delete().eq('id', id)
    if (result.error) throw result.error
    posts = posts.filter(function (post) { return String(post.id) !== String(id) })
  }

  function getPage (name) {
    if (pages[name]) return JSON.parse(JSON.stringify(pages[name]))
    return JSON.parse(JSON.stringify(DEFAULT_PAGES[name]))
  }

  async function savePage (name, data) {
    var result = await thSupabase.from('site_pages').upsert({
      slug: name,
      content: data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'slug' }).select('slug, content').single()
    if (result.error) throw result.error
    pages[name] = result.data.content
    return pages[name]
  }

  function readImage (file, onDone, onError) {
    if (!file.type || file.type.indexOf('image/') !== 0) {
      onError('File đã chọn không phải là ảnh.')
      return
    }

    var reader = new FileReader()
    reader.onerror = function () { onError('Không đọc được file ảnh.') }
    reader.onload = function () {
      var img = new Image()
      img.onerror = function () { onError('Ảnh bị lỗi hoặc không mở được.') }
      img.onload = function () {
        var width = img.width
        var height = img.height
        var maxWidth = 1600
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width)
          width = maxWidth
        }

        var canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob(async function (blob) {
          if (!blob) { onError('Không xử lý được ảnh này.'); return }
          try {
            var id = (window.crypto && crypto.randomUUID)
              ? crypto.randomUUID()
              : String(Date.now()) + '-' + Math.random().toString(16).slice(2)
            var path = 'posts/' + id + '.jpg'
            var uploaded = await thSupabase.storage.from('travel-images').upload(path, blob, {
              contentType: 'image/jpeg', cacheControl: '3600', upsert: false
            })
            if (uploaded.error) throw uploaded.error
            var publicResult = thSupabase.storage.from('travel-images').getPublicUrl(path)
            onDone(publicResult.data.publicUrl)
          } catch (error) {
            onError('Không tải được ảnh lên Storage: ' + error.message)
          }
        }, 'image/jpeg', 0.82)
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  return {
    init: init, all: all, get: get, upsert: upsert, remove: remove,
    readImage: readImage, getPage: getPage, savePage: savePage
  }
})()
