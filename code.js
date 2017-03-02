var rowSize; // check the puzzle size (eg. 4x4 : rowSize = 4)
var imgArray = []; // img array with key(1-16 flattened value) and value (imgId)
var emptyTileRow; // check on which row the empty tile is (the last part of the picture)

var sp = {

        init: function () {
            sp.getRowSize();
            sp.setListenerToImg();
            sp.setTiles();
        },

        getRowSize: function () {
            rowSize = $('tr').length;
        },

        setListenerToImg: function () {
            $('img').on('click', function () {
                sp.swap($("#" + this.id));
            });
        },

        swap: function (clickedImg) {
            if (!clickedImg.is(':hidden')) {
                var emptyTileIndex = $("img:hidden").attr('hidden', 'true').attr('id');
                var id = clickedImg.attr('id').split('');
                var emptyTile = $("#" + emptyTileIndex);

                var x = [-1, 0, 1, 0];
                var y = [0, 1, 0, -1];

                for (var i = 0; i < 4; i++) {
                    var xToCheck = (parseInt(id[0]) + x[i]).toString();
                    var yToCheck = (parseInt(id[1]) + y[i]).toString();

                    if (emptyTileIndex == xToCheck + yToCheck) {
                        var temp = clickedImg.attr('src');
                        clickedImg.attr('src', emptyTile.attr('src')).attr('hidden', 'true');
                        emptyTile.attr('src', temp).removeAttr('hidden');
                    }
                }
            }
        },

        setTiles: function () {
            var imgIndex = []; // img id in order 00-33 as the img id to loop to shuffle

            for (var i = 0; i < rowSize; i++) {
                for (var j = 0; j < rowSize; j++) {
                    // convert id into 1-16 value as flattened order
                    var flattenedValue = (i + 1) + (j * rowSize);

                    imgArray.push({
                        "flattenedValue": flattenedValue,
                        "imgId": i.toString() + j.toString()
                    });

                    imgIndex.push(i.toString() + j.toString());
                }
            }

            //shuffle until it is solvable.

            do {
                sp.shuffleList(imgArray);
            } while (!solvability.checkSolvability())

            //set the solvable shuffled tiles using jquery instead of for loop
            $.each(imgIndex, function (i) {
                    var cell = $("#" + this).attr('src', 'img/hall-' + imgArray[i].imgId + '.jpg');

                    if (imgArray[i].imgId == (rowSize - 1) * 11) {
                        cell.attr('hidden', 'true');
                    }
                }
            );
    },

    shuffleList: function (array) {
        //https://bost.ocks.org/mike/shuffle/
        var m = array.length,
            t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
    }
};

var solvability = {
    checkSolvability: function () {
        var inversions = 0;
        var listToCheck = solvability.convertListOrder(); // flattened order with 1-15 (without empty tile) value

        for (var i = 0; i < listToCheck.length; i++) {
            for (var j = i + 1; j < listToCheck.length; j++) {
                if ((listToCheck[i].flattenedValue > listToCheck[j].flattenedValue)) {
                    inversions++;
                }
            }
        }

        return solvability.checkInversion(inversions);
    },

    checkInversion: function (inversions) {
        if (rowSize % 2 == 1) { // odd numbered row (3x3, 5x5..)
            return (inversions % 2 == 0);
        } else { // even numbered row (4x4...)
            console.log("odd inversion + odd distance/ even inversion - even distance : solvability :" + ((inversions + rowSize - emptyTileRow) % 2 == 0));
            console.log("inversion: " + inversions + " empty tile : " + emptyTileRow + ", row distance between empty and bottom: " + (rowSize - emptyTileRow));

            return ((inversions + rowSize - emptyTileRow) % 2 == 0);
        }
    },

    convertListOrder: function () {
        var flattenedOrder = [];
        // index written out in a flattened order (0,4,8,12,1,5,9,13,2,6,10,14,3,7,11,15) 
        // img list order by index above for inversion polarity check
        for (var j = 0; j < rowSize; j++) {
            for (var k = 0; k < rowSize; k++) {
                flattenedOrder.push(imgArray[(k * rowSize) + j]);

                $.each(flattenedOrder, function (i) {
                    if (this.imgId == (rowSize - 1) * 11) { //only until 99 otherwise : this.imgId.toString == (rowSize-1).toString+(rowSize-1).toString()
                        emptyTileRow = Math.floor(i / 4) + 1;
                    }
                });
            }
        }

        //check the flattened order using 1-16 index (without 16) AND return the list to check inversions
        return $.grep(flattenedOrder, function (n) {
            return n.flattenedValue != (rowSize * rowSize);
        });
    }
};

$(sp.init);