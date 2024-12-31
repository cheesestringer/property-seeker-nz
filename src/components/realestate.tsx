import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { cachePrice, getCachedPrice, toCurrencyFormat } from '~common';
import { propertySeeker, seeking } from '~constants';
import { getPrice } from '~services/realestateService';

export const Realestate: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [message, setMessage] = useState('');
  const [range, setRange] = useState<number>(null);
  const controller = new AbortController();

  useEffect(() => {
    handleListing();
  }, []);

  const handleListing = async () => {
    const { element } = anchor;
    const testid = element.attributes.getNamedItem('data-test')?.value;
    console.log(testid);
    console.log(element);

    // Handle property listings
    if (testid === 'listing-pricing-method') {
      getPropertyPrice(window.location.href);
      return;
    }

    // Handle map listings
    if (testid === 'property-price-display') {
      const link = element.closest('a');
      if (!link?.href) {
        return;
      }

      getPropertyPrice(link.href);
      return;
    }

    // TODO: Handle stacked map listings

    // Handle list listings
    if (element.querySelector('[data-test="price-display__price-method"]')) {
      const link = element.closest('a');
      if (!link?.href) {
        return;
      }

      const observer = new IntersectionObserver(async entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            getPropertyPrice(link.href);
          }
        }
      });

      observer.observe(anchor.element);
    }
  };

  const getPropertyPrice = async (href: string) => {
    try {
      const url = new URL(href);
      const id = url.pathname.split('/')[1];

      const cachedPrice = getCachedPrice(id);
      if (cachedPrice) {
        setRange(cachedPrice);
        return;
      }

      const price = await getPrice(id, controller.signal);
      cachePrice(id, price);
      setRange(price);
    } catch (error) {
      console.log(error);
      setMessage('Failed to get price 😵');
    }
  };

  return (
    <div className="container">
      <img className="logo" src={logo} alt={propertySeeker} title={propertySeeker} />
      {message && <span className="message">{message}</span>}
      {!message && <span className="price">{range ? toCurrencyFormat(range) : seeking}</span>}
    </div>
  );
};
