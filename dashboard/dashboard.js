const app = angular.module('bugetifyApp', [])
// angular.module('bugetifyApp', [])
app.controller('MainController', function($scope) {

    $scope.formType = 'credit';

    $scope.stats = {
        total: 45230.50,
        deposit: 75000.00,
        expense: 29769.50
    };

    $scope.transactions = [
        {
            id: 'TXN001',
            description: 'Salary Deposit',
            type: 'Credit',
            amount: 50000.00,
            time: '2026-01-14 09:30'
        },
        {
            id: 'TXN002',
            description: 'Grocery Shopping',
            type: 'Debit',
            amount: 3450.00,
            time: '2026-01-13 14:20'
        },
        {
            id: 'TXN003',
            description: 'Freelance Payment',
            type: 'Credit',
            amount: 25000.00,
            time: '2026-01-12 11:15'
        },
        {
            id: 'TXN004',
            description: 'Electricity Bill',
            type: 'Debit',
            amount: 2340.50,
            time: '2026-01-11 16:45'
        },
        {
            id: 'TXN005',
            description: 'Restaurant',
            type: 'Debit',
            amount: 1250.00,
            time: '2026-01-10 20:30'
        }
    ];

    $scope.newTransaction = {};

    $scope.addTransaction = function () {
        var transaction = {
            id: $scope.newTransaction.id,
            description: $scope.newTransaction.description,
            type: $scope.newTransaction.type,
            amount: parseFloat($scope.newTransaction.amount),
            time: new Date().toLocaleString('en-IN')
        };

        $scope.transactions.unshift(transaction);

        if (transaction.type === 'Credit') {
            $scope.stats.deposit += transaction.amount;
            $scope.stats.total += transaction.amount;
        } else {
            $scope.stats.expense += transaction.amount;
            $scope.stats.total -= transaction.amount;
        }

        $scope.newTransaction = {};
    };

    $scope.$watch('formType', function(val) {
        $scope.newTransaction.type = val === 'credit' ? 'Credit' : 'Debit';
    });

    $scope.customer_logout = function(){
        console.log("in logout funstion")
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('customer')

        // showAlert('Logged Successfully', 'success')
        window.location.href = '../index.html'
    }

});
