import { default as Color } from 'src/util/color';

describe('color', () => {
  const color = new Color({ color: '#FF0000', format: 'rgb' });
  it('color is', () => {
    expect(color.color).toEqual('rgb(255, 0, 0)');
  });
});
