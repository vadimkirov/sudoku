module.exports =function solveSudoku(matrix) {
    // your solution

    let steps = 0,
        backtracking_call = 0,
        reserveSolved,
        row,
        col,
        variantsDigit,
        solvedMatrix = initSolved(matrix),
        resultSudoku = solve(solvedMatrix);

    return result(resultSudoku);

    /**
     * Инициализация рабочего массива
     *
     * Рабочий массив представляет собой матрицу 9х9, каждый элемент которой
     * является списком из трех элементов: число, тип элемента (in - заполнен
     * по услвоию, unknown - решение не найдено, solved - решено) и перечень
     * предполагаемых значений элемента.
     */
    function initSolved(in_val) {
        let solved = [];
        steps = 0;
        let suggest = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = 0; i < 9; i++) {
            solved[i] = [];
            for (let j = 0; j < 9; j++) {
                if (in_val[i][j]) {
                    solved[i][j] = [in_val[i][j], 'in', []];
                } else {
                    solved[i][j] = [0, 'unknown', suggest];
                }
            }
        }
        return solved;
    } // end of method initSolved()


    /**
     * Решение судоку
     *
     * Метод в цикле пытается решить судоку, если на текущем этапе не изменилось
     * ни одного элемента, то решение прекращается.
     */
    function solve(solved) {
        let changed = 0;
        do {
            // сужаем множество значений для всех нерешенных чисел
            changed = updateSuggests(solved);
            steps++;
            if (81 < steps) {
                // Зашита от цикла
                break;
            }
        } while (changed);

        while (!isSolved(solved)) {
            // используем поиск с возвратом
            solved = backtracking(solved);
        }
        return solved;
    } // end of method solve()


    /**
     * Обновляем множество предположений
     *
     * Проверяем основные правила -- уникальность в строке, столбце и секции.
     */
    function updateSuggests(solved) {
        let changed = 0;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if ('unknown' !== solved[i][j][1]) {
                    // Здесь решение либо найдено, либо задано
                    continue;
                }
                // "Явный единственный вариант"
                if (1 === solveSingle(solved, i, j)) {
                    changed++;
                } else {
                    // "Скрытый одиночка"
                    changed += solveHiddenSingle(solved, i, j);
                }
            }
        }
        return changed;
    } // end of method updateSuggests()


    /**
     * Метод "Явный единственный вариант"
     */
    function solveSingle(solved, i, j) {
        solved[i][j][2] = arrayDiff(solved[i][j][2], rowContent(solved, i));
        if (1 === solved[i][j][2].length) {
            // Исключили все варианты кроме одного
            markSolved(solved, i, j, solved[i][j][2][0]);
            return 1;
        }
        solved[i][j][2] = arrayDiff(solved[i][j][2], colContent(solved, j));
        if (1 === solved[i][j][2].length) {
            // Исключили все варианты кроме одного
            markSolved(solved, i, j, solved[i][j][2][0]);
            return 1;
        }
        solved[i][j][2] = arrayDiff(solved[i][j][2], sectContent(solved, i, j));
        if (1 === solved[i][j][2].length) {
            // Исключили все варианты кроме одного
            markSolved(solved, i, j, solved[i][j][2][0]);
            return 1;
        }
        return 0;
    } // end of method solveSingle()


    /**
     * Метод "Скрытый одиночка"
     */
    function solveHiddenSingle(solved, i, j) {
        let less_suggest;
        less_suggest = lessRowSuggest(solved, i, j);
        let changed = 0;
        if (1 === less_suggest.length) {
            markSolved(solved, i, j, less_suggest[0]);
            changed++;
        }
        less_suggest = lessColSuggest(solved, i, j);
        if (1 === less_suggest.length) {
            markSolved(solved, i, j, less_suggest[0]);
            changed++;
        }
        less_suggest = lessSectSuggest(solved, i, j);
        if (1 === less_suggest.length) {
            markSolved(solved, i, j, less_suggest[0]);
            changed++;
        }
        return changed;
    } // end of method solveHiddenSingle()


    /**
     * Отмечаем найденный элемент как решение
     */
    function markSolved(sol, i, j, solve) {
        sol[i][j][0] = solve;
        sol[i][j][1] = 'solved';
    } // end of method markSolved()


    /**
     * Содержимое строки
     */
    function rowContent(solved, i) {
        let content = [];
        for (let j = 0; j < 9; j++) {
            if ('unknown' !== solved[i][j][1]) {
                content[content.length] = solved[i][j][0];
            }
        }
        return content;
    } // end of method rowContent()


    /**
     * Содержимое столбца
     */
    function colContent(solved, j) {
        let content = [];
        for (let i = 0; i < 9; i++) {
            if ('unknown' !== solved[i][j][1]) {
                content[content.length] = solved[i][j][0];
            }
        }
        return content;
    } // end of method colContent()


    /**
     * Содержимое секции
     */
    function sectContent(solved, i, j) {
        let content = [];
        let offset = sectOffset(i, j);
        for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
                if ('unknown' !== solved[offset.i + k][offset.j + l][1]) {
                    content[content.length] = solved[offset.i + k][offset.j + l][0];
                }
            }
        }
        return content;
    } // end of method sectContent()


    /**
     * Минимизированное множество предположений по строке
     */
    function lessRowSuggest(solved, i, j) {
        let less_suggest = solved[i][j][2];
        for (let k = 0; k < 9; k++) {
            if (k === j || 'unknown' !== solved[i][k][1]) {
                continue;
            }
            less_suggest = arrayDiff(less_suggest, solved[i][k][2]);
        }
        return less_suggest;
    } // end of method lessRowSuggest()


    /**
     * Минимизированное множество предположений по столбцу
     */
    function lessColSuggest(solved, i, j) {
        let less_suggest = solved[i][j][2];
        for (let k = 0; k < 9; k++) {
            if (k === i || 'unknown' !== solved[k][j][1]) {
                continue;
            }
            less_suggest = arrayDiff(less_suggest, solved[k][j][2]);
        }
        return less_suggest;
    } // end of method lessColSuggest()


    /**
     * Минимизированное множество предположений по секции
     */
    function lessSectSuggest(solved, i, j) {
        let less_suggest = solved[i][j][2];
        let offset = sectOffset(i, j);
        for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
                if (((offset.i + k) === i && (offset.j + l) === j) || 'unknown' !== solved[offset.i + k][offset.j + l][1]) {
                    continue;
                }
                less_suggest = arrayDiff(less_suggest, solved[offset.i + k][offset.j + l][2]);
            }
        }
        return less_suggest;
    } // end of method lessSectSuggest()


    /**
     * Вычисление разницы между двумя массивами(используем для сравнения вариантов по строке=>столбцу=>секции )
     */
    function arrayDiff(ar1, ar2) {
        let arr_diff = [];
        for (let i = 0; i < ar1.length; i++) {
            let is_found = false;
            for (let j = 0; j < ar2.length; j++) {
                if (ar1[i] === ar2[j]) {
                    is_found = true;
                    break;
                }
            }
            if (!is_found) {
                arr_diff[arr_diff.length] = ar1[i];
            }
        }
        return arr_diff;
    } // end of method arrayDiff()

    /**
     * Расчет смещения секции
     */
    function sectOffset(i, j) {
        return {
            j: Math.floor(j / 3) * 3,
            i: Math.floor(i / 3) * 3
        };
    } // end of method sectOffset()

    /**
     * Вывод найденного решения
     */
    function result(solved) {
        let resultSudoku = [];
        for (let i = 0; i < 9; i++) {
            resultSudoku[i] = [];
            for (let j = 0; j < 9; j++) {
                resultSudoku[i][j] = solved[i][j][0];
            }
        }
        return resultSudoku;
    }

    /**
     * Проверка на найденное решение - не осталось элементов с меткой 'unknown'
     */
    function isSolved(solved) {
        let is_solved = true;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if ('unknown' === solved[i][j][1]) {
                    is_solved = false;
                }
            }
        }

        return is_solved;
    } // end of method isSolved()

    /**
     * Есть ли ошибка в поиске решения
     *
     * Возвращает true, если хотя бы у одной из ненайденных ячеек
     * отсутствуют кандидаты
     */
    function isFailed(solved) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if ('unknown' === solved[i][j][1] && !solved[i][j][2].length) {
                    return  true;
                }
            }
        }
        return false;
    } // end of method isFailed()

    /**
     * Мпетод поиска с возвратом
     */
    function backtracking(solved) {

        if(10 < backtracking_call) throw new Error('слишком много вариантов');

        let topIndex = 9,
            findNumber = 0;

        if (!isFailed(solved)) {

            // резервная копия массива с возможным вариантом решения
            reserveSolved = [[], [], [], [], [], [], [], [], []];
            for ( let i=0; i<9; i++ ) {
                reserveSolved[i].length = 9;
                for ( let j=0; j<9; j++ ) {
                    reserveSolved[i][j] = solved[i][j][0];
                }
            }

            // Ищем построчно самый короткий массив вариантов
            let minLengthArrayOfVariants = 9;

            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if ('unknown' === solved[i][j][1] && minLengthArrayOfVariants > solved[i][j][2].length) {
                        minLengthArrayOfVariants = solved[i][j][2].length;
                        row = i;
                        col = j;
                    }
                }
            }
            let rez = [];

            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < minLengthArrayOfVariants; j++) {

                    if (-1 !== solved[row][col][2].indexOf(solved[row][i][2][j])) {
                        rez.push(solved[row][i][2][j]);
                    }
                }
            }

            variantsDigit = rez.reduce((acc, el) => {
                acc[el] = (acc[el] || 0) + 1;
                return acc;
            }, {});

            for (let key in variantsDigit) {
                if (topIndex > +variantsDigit[key]) {
                    topIndex = +variantsDigit[key];
                    findNumber = +key;
                }

                markSolved(solved, row, col, findNumber);
                delete variantsDigit[findNumber];  //удаляем уже подставленный элемент
                return solve(solved);
            }
        } else {

            backtracking_call++;
            solved = initSolved(reserveSolved); //возврат резервного массива после неудачной подстановки

            for (let key in variantsDigit) {
                if (topIndex > +variantsDigit[key]) {
                    topIndex = +variantsDigit[key];
                    findNumber = +key;
                }

                markSolved(solved, row, col, findNumber);
                delete variantsDigit[findNumber]; //удаляем уже подставленный элемент
                return solve(solved);
            }
        }
    } // end of function backtracking)(
};
