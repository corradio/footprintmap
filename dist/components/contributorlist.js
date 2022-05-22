import React from "../pkg/react.js";
import {useParams} from "../pkg/react-router-dom.js";
const zonesConfig = [];
const ContributorList = () => {
  const {zoneId} = useParams();
  const contributors = (zonesConfig[zoneId] || {}).contributors || [];
  return /* @__PURE__ */ React.createElement("div", {
    className: "contributors"
  }, contributors.map((contributor) => /* @__PURE__ */ React.createElement("a", {
    key: contributor,
    href: contributor,
    rel: "noopener noreferrer",
    target: "_blank"
  }, /* @__PURE__ */ React.createElement("img", {
    src: `${contributor}.png`,
    alt: contributor
  }))));
};
export default ContributorList;
