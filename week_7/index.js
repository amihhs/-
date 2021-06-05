// //1. 允许小数的四则运算产生式 
// 四则运算表达式 ::= 加法算式
// 加法算式 ::= (加法算式 ("+"|"-") 乘法算式）| 乘法算式
// 乘法算式 ::= (乘法算式 ("*"|"/") 数字) | 数字
// 数字 ::= {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}.{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}

// //2. 允许括号的四则运算产生式
// 四则运算表达式 ::= 加法算式
// 加法算式 ::= (加法算式 ("+"|"-") 乘法算式）| 乘法算式
// 乘法算式 ::= (乘法算式 ("*"|"/") 括号算式) | 括号算式
// 括号算式 ::= (括号算式 ("*"|"/"|"+"|"-") 数字) | 数字
// 数字 ::= {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}.{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}


//3
// inputElement ::= whiteSpace | lineTerminator | comment | token

// whiteSpace ::= 符合Unicode的空格

// lineTerminator ::= 符合Unicode的换行符

// comment ::= singleLineComment | multiLineComment
// singleLineComment ::= "/""/" any*
// multiLineComment ::= "/""*" ([^*] | "*"[^/])* "*""/"

// token ::= literal | keywords | identifier | punctuator
// literal ::= numberLiteral | stringLiteral | booleanLiteral | nullLiteral
// keywords ::= 'if' ...
// identifier ::=  标识符
// punctuator ::+ '-' ...

//5

// program ::= statement+

// statement ::= expressionStatement | ifStatement | forStatement 
// | variableDeclaration | functionDeclaration | classDeclaration 
// | breakStatement | continueStatement | returnStatement | throwStatement 
// | tryStatement | block 

// expressionStatement ::=  expression ";"
// expression ::= additiveExpression
// additiveExpression ::= multiplicativeExpression | additiveExpression ("+" | "-") multiplicativeExpression
// multiplicativeExpression ::= unaryExpression | multiplicativeExpression ("*" | "/") unaryExpression

// unaryExpression ::= primaryExpression | ("+" | "-" | "typeof")primaryExpression

// primaryExpression ::= "("expression")" | literal | identifier

// ifStatement ::= "if" "(" expression ")" statement 

// block ::= "{" statement "}"

// tryStatement ::= "try" "{" statement+  "}" "catch" "(" expression ")" "{" statement+ "}"


