// Needle paths adapted from the user-supplied 22.43.zip.
export function stitchGeometry(name) {
  const paths = [];
  const add = (d, c = 0, w = 2.5) => paths.push({ d, c, w });
  if (name === '平绣') {
    // 排列紧密、方向统一的长短针，将一片花瓣逐渐铺满。
    for (let i = 0; i < 19; i++) {
      const y = 23 + i * 2.9, edge = Math.sqrt(Math.max(0, 1 - ((y - 49) / 29) ** 2));
      const left = 49 - 27 * edge, right = 49 + 27 * edge;
      add(`M ${left.toFixed(1)} ${y.toFixed(1)} L ${right.toFixed(1)} ${(y + .7).toFixed(1)}`, i % 4 === 0 ? 1 : 0, 2.75);
    }
    add('M49 18 C13 27 15 68 49 79 C83 68 85 27 49 18', 2, 1.1);
  } else if (name === '破线绣') {
    // 多股极细分丝同向并行，密而轻薄。
    for (let row = 0; row < 10; row++) for (let strand = 0; strand < 3; strand++) {
      const y = 22 + row * 5.1 + strand * 1.12;
      add(`M ${26 + row * .65} ${y.toFixed(2)} Q 50 ${(y - 8 - strand * .3).toFixed(2)} ${74 - row * .55} ${(y - 3).toFixed(2)}`, strand === 1 ? 1 : 0, .78);
    }
  } else if (name === '锁绣') {
    // 小环环扣，每一针穿过前一个环。
    for (let i = 0; i < 13; i++) {
      const x = 15 + i * 5.6, y = 48 + Math.sin(i * .34) * 9;
      add(`M ${x.toFixed(1)} ${y.toFixed(1)} C ${(x - 5).toFixed(1)} ${(y - 12).toFixed(1)} ${(x + 8).toFixed(1)} ${(y - 13).toFixed(1)} ${(x + 6).toFixed(1)} ${(y + 1).toFixed(1)} C ${(x + 5).toFixed(1)} ${(y + 5).toFixed(1)} ${(x + 1).toFixed(1)} ${(y + 4).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`, i % 2, 2.2);
    }
  } else if (name === '缠绣') {
    // 先铺一根芯线，再反复斜绕包裹芯线。
    add('M 18 49 C 39 35 58 61 83 46', 2, 3.3);
    for (let i = 0; i < 25; i++) {
      const x = 19 + i * 2.55, y = 49 - Math.sin(i / 24 * Math.PI * 2) * 5;
      add(`M ${(x - 2).toFixed(1)} ${(y - 7).toFixed(1)} Q ${(x + 4).toFixed(1)} ${y.toFixed(1)} ${(x + 2).toFixed(1)} ${(y + 7).toFixed(1)}`, i % 3 === 0 ? 1 : 0, 2.5);
    }
  } else if (name === '辫绣') {
    // 左右两股交叉，形成连续的交编纹理。
    for (let i = 0; i < 17; i++) {
      const x = 20 + i * 3.7;
      add(`M ${x.toFixed(1)} 38 Q ${(x + 6).toFixed(1)} 49 ${(x + 3.7).toFixed(1)} 61`, i % 2, 2.9);
      add(`M ${x.toFixed(1)} 61 Q ${(x + 6).toFixed(1)} 49 ${(x + 3.7).toFixed(1)} 38`, (i + 1) % 2, 2.9);
    }
  } else {
    // 打籽绣：针线绕针打结，颗粒逐粒密布。
    for (let row = 0; row < 4; row++) for (let col = 0; col < 6; col++) {
      const x = 29 + col * 8.2 + (row % 2) * 4, y = 32 + row * 11;
      add(`M ${x} ${y} c -5 -6 7 -9 6 0 c -1 7 -10 7 -10 0 c 0 -4 7 -5 8 -1`, (row + col) % 2, 2.6);
    }
  }
  return paths;
}

// 由真实走针路径拼接连续的运针轨迹：0.84 段时间落针缝制，其余平滑移针。
// 使用 SVG 实际路径长度归一化运动关键帧，针尖与丝线绘制始终同步。
export function stitchNeedleMotion(paths, sewRatio) {
  const ns = 'http://www.w3.org/2000/svg';
  const measure = d => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    return p;
  };
  const sections = paths.map(piece => {
    const shape = measure(piece.d);
    const length = Math.max(.001, shape.getTotalLength());
    const start = shape.getPointAtLength(0);
    const end = shape.getPointAtLength(length);
    const to = shape.getPointAtLength(Math.min(length, 1.4));
    const from = shape.getPointAtLength(Math.max(0, length - 1.4));
    const direction = (a, b) => {
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      return {x:dx/len,y:dy/len};
    };
    return {d:piece.d, start, end, length,
      entry:direction(start, to), exit:direction(from, end)};
  });
  let d = sections[0].d, distance = sections[0].length;
  const distances = [0, distance];
  const times = [0, sewRatio / sections.length];
  for (let i = 1; i < sections.length; i++) {
    const previous = sections[i - 1], next = sections[i];
    const dx = next.start.x - previous.end.x, dy = next.start.y - previous.end.y;
    const reach = Math.min(7.2, Math.hypot(dx, dy) * .33);
    const bridge = `M ${previous.end.x} ${previous.end.y} C ${previous.end.x + previous.exit.x * reach} ${previous.end.y + previous.exit.y * reach} ${next.start.x - next.entry.x * reach} ${next.start.y - next.entry.y * reach} ${next.start.x} ${next.start.y}`;
    // 两针之间仅走空针：以曲线衔接，丝线不会画出穿越绣面的无关线段。
    d += bridge.slice(bridge.indexOf(' C ') + 1);
    distance += measure(bridge).getTotalLength();
    distances.push(distance);
    times.push(i / sections.length);
    d += next.d.replace(/^\s*M\s*[-+]?\d*\.?\d+\s+[-+]?\d*\.?\d+\s*/i, ' ');
    distance += next.length;
    distances.push(distance);
    times.push((i + sewRatio) / sections.length);
  }
  distances.push(distance);
  times.push(1);
  return {
    path: d,
    points: distances.map(v => (v / distance).toFixed(6)).join(';'),
    times: times.map(v => v.toFixed(6)).join(';')
  };
}
