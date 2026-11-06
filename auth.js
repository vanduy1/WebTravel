/*
 * Supabase Auth + quyền quản trị từ public.admin_users.
 * Có tài khoản không đồng nghĩa có quyền admin; quyền ghi luôn được kiểm tra lại bằng RLS.
 */
var Auth = (function () {
  var session = null
  var admin = false

  async function refresh () {
    var result = await thSupabase.auth.getSession()
    if (result.error) throw result.error
    session = result.data.session || null
    admin = false

    if (session && session.user) {
      var access = await thSupabase.from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle()
      if (access.error) throw access.error
      admin = !!access.data
    }
    return admin
  }

  async function init () {
    return refresh()
  }

  async function login (email, password) {
    var result = await thSupabase.auth.signInWithPassword({ email: email, password: password })
    if (result.error) return { ok: false, message: result.error.message }

    try {
      await refresh()
    } catch (error) {
      await thSupabase.auth.signOut()
      session = null
      admin = false
      return { ok: false, message: 'Không kiểm tra được quyền quản trị: ' + error.message }
    }

    if (!admin) {
      await thSupabase.auth.signOut()
      session = null
      admin = false
      return { ok: false, message: 'Tài khoản chưa được cấp quyền quản trị THTravel.' }
    }
    return { ok: true }
  }

  async function signUp (email, password) {
    var result = await thSupabase.auth.signUp({ email: email, password: password })
    if (result.error) return { ok: false, message: result.error.message }

    var confirmationRequired = !(result.data && result.data.session)
    if (!confirmationRequired) await thSupabase.auth.signOut()

    return { ok: true, confirmationRequired: confirmationRequired }
  }

  async function logout () {
    var result = await thSupabase.auth.signOut()
    session = null
    admin = false
    if (result.error) throw result.error
  }

  function currentUser () {
    return session && session.user ? (session.user.email || '') : ''
  }

  function isLoggedIn () {
    return admin
  }

  return {
    init: init,
    refresh: refresh,
    login: login,
    signUp: signUp,
    logout: logout,
    currentUser: currentUser,
    isLoggedIn: isLoggedIn
  }
})()
