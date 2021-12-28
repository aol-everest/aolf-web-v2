import { useRouter } from "next/router";
import Link from "next/link";
import React, { Children } from "react";

export const ActiveLink = ({
  children,
  activeClassName,
  setCollapsed,
  href,
  ...props
}) => {
  const { asPath } = useRouter();
  const child = Children.only(children);
  const childClassName = child.props.className || "";

  // pages/index.js will be matched via props.href
  // pages/about.js will be matched via props.href
  // pages/[slug].js will be matched via props.as
  const className =
    asPath === href || asPath === props.as
      ? `${childClassName} ${activeClassName}`.trim()
      : childClassName;

  return (
    <Link {...props} href={href} prefetch={false}>
      {React.cloneElement(child, {
        className: className || null,
        onClick: () => {
          if (setCollapsed) {
            setCollapsed(false);
          }
        },
      })}
    </Link>
  );
};
