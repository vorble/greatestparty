function fmt02d(value: number) {
  const result = '' + value;
  return result.length == 1 ? '0' + result : result;
}
