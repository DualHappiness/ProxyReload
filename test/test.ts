export const a = {
    b: 0,
    c: function (count: number) {
        for (let i = 0; i < count; i++)
            this.b += 1;
    },
    d: [1, 2, 3, 4]
};
