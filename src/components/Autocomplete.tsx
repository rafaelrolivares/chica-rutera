import React from 'react';

type AutocompleteProps = {
  items: string[];
  selectAction: (address: string) => void;
};

export const Autocomplete = ({ items, selectAction }: AutocompleteProps) => {
  return (
    <>
      {items.map((item, i) => (
        <div
          className="autocomplete-suggestion"
          key={i + 1}
          onClick={() => selectAction(item)}
        >
          {item}
        </div>
      ))}
    </>
  );
};
