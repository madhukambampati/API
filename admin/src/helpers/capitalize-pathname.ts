function capitalizePathname(input: string): string {
  const lastSegment = input.split('/').at(-1);

  if (lastSegment) {
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } else return '';
}

export default capitalizePathname;
