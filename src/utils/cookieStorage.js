import Cookies from 'universal-cookie';

/** @class */
export default class CookieStorage {
  /**
   * Constructs a new CookieStorage object
   * @param {object} data Creation options.
   * @param {string} data.domain Cookies domain (default: domain of the page
   * 				where the cookie was created, excluding subdomains)
   * @param {string} data.path Cookies path (default: '/')
   * @param {integer} data.expires Cookie expiration (in days, default: 2)
   * @param {boolean} data.secure Cookie secure flag (default: true)
   * @param {string} data.sameSite Cookie request behavior (default: 'Lax')
   */
  constructor(data = {}) {
    this.cookies = new Cookies();
    this.domain = data.domain || null;
    this.path = data.path || '/';
    this.expires = data.expires !== undefined ? data.expires : 2;
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
      expires: new Date(Date.now() + this.expires * 24 * 60 * 60 * 1000),
      domain: this.domain,
      secure: this.secure,
      sameSite: this.sameSite,
    };

    this.cookies.set(key, value, options);
    return this.cookies.get(key);
  }

  /**
   * Retrieves a specific item from cookie storage
   * @param {string} key - The key for the item
   * @returns {string | undefined} The value of the key, or undefined if not found
   */
  getItem(key) {
    return this.cookies.get(key);
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

    this.cookies.remove(key, options);
  }

  /**
   * Clears all cookies set in the current domain and path
   * @returns {object} An empty object
   */
  clear() {
    const allCookies = this.cookies.getAll();
    Object.keys(allCookies).forEach((key) => {
      this.removeItem(key);
    });
    return {};
  }
}
