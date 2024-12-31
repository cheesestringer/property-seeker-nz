import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { Realestate } from '~components/realestate';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.co.nz/*']
};

// Inline the stylesheets since css files currently get bundled in to content scripts as resources
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    #plasmo-shadow-container {
      z-index: 1 !important;
    }
    .container {
      display: flex;
      align-items: center;
      margin-top: 12px;
    }
    .logo {
      height: 32px;
    }
    span {
      padding-left: 5px;
    }
    .message {
      font-size: 15px;
    }
    .price {
      font-size: 15px;
      font-weight: 600;
    }
  `;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => document.querySelectorAll('[data-test="property-price-display"]');

const RealestateMap = ({ anchor }) => <Realestate anchor={anchor} />;

export default RealestateMap;
