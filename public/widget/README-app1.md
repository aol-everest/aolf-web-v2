# Embedding AOL-F Header Widget (postMessage version)

1. **Add an invisible iframe to your page:**

```html
<iframe id="auth-profile-iframe" src="https://YOUR-APP2-SUBDOMAIN.artofliving.org/widget/auth-profile" style="display:none;"></iframe>
```

2. **Request auth/profile/menu from the iframe:**

```js
const APP2_ORIGIN = 'https://YOUR-APP2-SUBDOMAIN.artofliving.org'; // Use the actual subdomain for app2
const iframe = document.getElementById('auth-profile-iframe');
iframe.onload = () => {
  iframe.contentWindow.postMessage({ type: 'get-auth-profile' }, APP2_ORIGIN);
};

window.addEventListener('message', (event) => {
  // Accept any *.artofliving.org subdomain
  if (!/https:\/\/([a-z0-9-]+\.)*artofliving\.org$/i.test(event.origin)) return;
  if (event.data?.type === 'auth-profile') {
    // event.data.data = { isAuthenticated, profile, menu }
    // Use this data to render your header
    console.log('Header data:', event.data.data);
  }
});
```

3. **(Recommended for Next.js/React) Use a React hook:**

Create `useAolfHeaderData.ts` in your app1 (e.g. `src/hooks`):

```ts
import { useEffect, useState } from 'react';

export interface AolfHeaderProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  // ...add any other fields you expect
}

export interface AolfHeaderMenuItem {
  label: string;
  href: string;
  // ...add any other fields you expect
}

export interface AolfHeaderData {
  isAuthenticated: boolean;
  profile: AolfHeaderProfile | null;
  menu: AolfHeaderMenuItem[];
}

export function useAolfHeaderData(app2Origin: string, app2WidgetUrl: string) {
  const [headerData, setHeaderData] = useState<AolfHeaderData | null>(null);

  useEffect(() => {
    let iframe = document.getElementById('auth-profile-iframe') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'auth-profile-iframe';
      iframe.style.display = 'none';
      iframe.src = app2WidgetUrl;
      document.body.appendChild(iframe);
    }

    function handleMessage(event: MessageEvent) {
      if (!/https:\/\/([a-z0-9-]+\.)*artofliving\.org$/i.test(event.origin)) return;
      if (event.data?.type === 'auth-profile') {
        setHeaderData(event.data.data);
      }
    }

    window.addEventListener('message', handleMessage);

    iframe.onload = () => {
      iframe!.contentWindow!.postMessage({ type: 'get-auth-profile' }, app2Origin);
    };

    return () => {
      window.removeEventListener('message', handleMessage);
      // Optionally: document.body.removeChild(iframe!);
    };
  }, [app2Origin, app2WidgetUrl]);

  return headerData;
}
```

**Usage in your header component (TypeScript):**

```tsx
import { useAolfHeaderData, AolfHeaderData } from '../hooks/useAolfHeaderData';

const APP2_ORIGIN = 'https://YOUR-APP2-SUBDOMAIN.artofliving.org';
const APP2_WIDGET_URL = APP2_ORIGIN + '/widget/auth-profile';

export default function Header() {
  const headerData = useAolfHeaderData(APP2_ORIGIN, APP2_WIDGET_URL);

  if (!headerData) return null; // or a loading spinner

  return (
    <div>
      {headerData.isAuthenticated
        ? <span>Welcome, {headerData.profile?.firstName}</span>
        : <button>Login</button>}
      {/* Render menu, etc */}
      <ul>
        {headerData.menu.map((item, idx) => (
          <li key={idx}><a href={item.href}>{item.label}</a></li>
        ))}
      </ul>
    </div>
  );
}
```

- Make sure to update the iframe src and APP2_ORIGIN to match your actual app2 deployment.
- Any subdomain of `artofliving.org` will be accepted by the widget responder.
 