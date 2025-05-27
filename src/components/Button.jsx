import React, { useState, useCallback, memo } from 'react';
import { buttonImages } from './ImageAssets';
import PropTypes from 'prop-types';

const Button = memo(({ type = 'mint', variant = 'big', onClick }) => {
  const [state, setState] = useState('idle');

  const handleMouseEnter = useCallback(() => {
    setState('hover');
  }, []);

  const handleMouseLeave = useCallback(() => {
    setState('idle');
  }, []);

  const handleMouseDown = useCallback(() => {
    setState('clicked');
  }, []);

  const handleMouseUp = useCallback(() => {
    setState('hover');
  }, []);

  const getButtonImage = useCallback(() => {
    if (type === 'mint') {
      return buttonImages.mint[variant][state];
    }
    return buttonImages[type][state];
  }, [type, variant, state]);

  return (
    <button
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        transform: state === 'clicked' ? 'scale(0.95)' : 'scale(1)'
      }}
    >
      <img
        src={getButtonImage()}
        alt={`${type} button`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block'
        }}
      />
    </button>
  );
});

Button.propTypes = {
  type: PropTypes.oneOf(['mint', 'twitter', 'wallet']),
  variant: PropTypes.oneOf(['big', 'up', 'down']),
  onClick: PropTypes.func
};

Button.displayName = 'Button';

export default Button; 