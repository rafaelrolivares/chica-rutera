export const fileHandler = (file: File) => {
  const reader = new FileReader();
  reader.readAsText(file, 'UTF-8');
  reader.onload = () => readAddresses(reader.result as string);

  reader.onerror = () => console.log('error reading file');

};

const readAddresses = (text: string) => {
  return Array.from(
    new Set(
      text
        .split('\n')
        .filter((a) => a)
        .map((a) => a.replace(/;/g, ', '))
    )
  );
};
