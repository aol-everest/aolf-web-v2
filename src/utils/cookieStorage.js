import Cookies from 'js-cookie';

/** @class */
export default class CookieStorage {
  /**
   * Constructs a new CookieStorage object
   * @param {object} data Creation options.
   * @param {string} data.domain Cookies domain (default: domain of the page
   * 				where the cookie was created, excluding subdomains)
   * @param {string} data.path Cookies path (default: '/')
   * @param {integer} data.expires Cookie expiration (in days, default: 365)
   * @param {boolean} data.secure Cookie secure flag (default: true)
   * @param {string} data.sameSite Cookie request behavior (default: 'Lax')
   */
  constructor(data = {}) {
    this.domain = data.domain || null;
    this.path = data.path || '/';
    this.expires = data.expires !== undefined ? data.expires : 365;
    this.secure = data.secure !== undefined ? data.secure : true;

    if (data.sameSite) {
      if (!['strict', 'lax', 'none'].includes(data.sameSite.toLowerCase())) {
        throw new Error(
          'The sameSite value of cookieStorage must be "lax", "strict" or "none".',
        );
      }
      if (data.sameSite.toLowerCase() === 'none' && !this.secure) {
        throw new Error(
          'sameSite="None" requires the Secure attribute in modern browsers.',
        );
      }
      this.sameSite = data.sameSite.toLowerCase();
    } else {
      this.sameSite = 'lax';
    }
  }

  /**
   * Sets a specific item in cookie storage
   * @param {string} key - The key for the item
   * @param {string} value - The value to store
   * @returns {string} The value that was set
   */
  setItem(key, value) {
    const options = {
      path: this.path,
      expires: this.expires,
      domain: this.domain,
      secure: this.secure,
      sameSite: this.sameSite,
    };

    Cookies.set(key, value, options);
    return Cookies.get(key);
  }

  /**
   * Retrieves a specific item from cookie storage
   * @param {string} key - The key for the item
   * @returns {string | undefined} The value of the key, or undefined if not found
   */
  getItem(key) {
    return Cookies.get(key);
  }

  /**
   * Removes a specific item from cookie storage
   * @param {string} key - The key of the item to remove
   */
  removeItem(key) {
    const options = {
      path: this.path,
      domain: this.domain,
      secure: this.secure,
      sameSite: this.sameSite,
    };

    Cookies.remove(key, options);
  }

  /**
   * Clears all cookies set in the current domain and path
   * @returns {object} An empty object
   */
  clear() {
    const cookies = Cookies.get();
    Object.keys(cookies).forEach((key) => {
      this.removeItem(key);
    });
    return {};
  }
}
